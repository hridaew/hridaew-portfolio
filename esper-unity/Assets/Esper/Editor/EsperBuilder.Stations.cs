using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    /// The stations: islands in a dark loft, each in its own pool of light, with floor between them.
    /// Room: x -5..5 (right wall +x), z -3.75..3.75 (window wall +z). The door is on the front wall (-z).
    ///   Window wall: Domis (left), ESPER/OBSCURA (right corner, the hero).
    ///   Left wall:   Off hours (toward the window), Memory Care (toward the door).
    ///   Right wall:  Virdio (toward the door).
    ///   Front wall:  Wafflings, beside the door.
    public static partial class EsperBuilder
    {
        public static readonly Dictionary<string, Bounds> stationBounds = new();
        public static readonly Dictionary<string, Light> stationAccent = new();
        public static readonly Dictionary<string, CrtScreen> stationScreen = new();

        static float HW => RoomW / 2;
        static float HD => RoomD / 2;

        static void Remember(string id, params GameObject[] objs)
        {
            var b = BoundsOf(objs[0]);
            foreach (var o in objs) b.Encapsulate(BoundsOf(o));
            stationBounds[id] = b;
        }

        /// A pool of warm light from above: how each station is found in the dark.
        static Light Pool(string name, Transform parent, Vector3 target, float intensity = 2.2f, float angle = 55f, float height = 3.15f)
        {
            return Practical(name, parent, new Vector3(target.x, height, target.z - 0.15f), new Color(1f, 0.72f, 0.48f), intensity, 4.5f,
                LightType.Spot, target, angle);
        }

        static void BuildRoomDressing()
        {
            var room = Group("Room", props);
            // One cast-iron radiator under the middle of the window.
            var rad = Group("Radiator", room);
            var radMat = Surface("RadiatorPaint", "painted_metal_shutter", 3f, new Color(0.45f, 0.43f, 0.4f), 0.6f);
            float rx0 = -0.8f, rx1 = 0.8f, rz = HD - 0.13f;
            for (float x = rx0; x <= rx1; x += 0.062f)
                Block("Fin", rad, new Vector3(x, 0.4f, rz), new Vector3(0.04f, 0.52f, 0.15f), radMat);
            Block("RadTop", rad, new Vector3(0, 0.67f, rz), new Vector3(rx1 - rx0 + 0.05f, 0.025f, 0.08f), radMat);
            Block("RadBottom", rad, new Vector3(0, 0.15f, rz), new Vector3(rx1 - rx0 + 0.05f, 0.025f, 0.08f), radMat);
            foreach (float x in new[] { rx0 + 0.04f, rx1 - 0.04f })
                Block("RadFoot", rad, new Vector3(x, 0.07f, rz), new Vector3(0.05f, 0.14f, 0.05f), radMat);

            // The door on the front wall: frame, slab, a brass handle catching the light.
            var door = Group("Door", room);
            var doorMat = Plain("DoorSlab", new Color(0.16f, 0.15f, 0.14f), 0.35f);
            var doorFrame = Plain("DoorFrame", new Color(0.1f, 0.1f, 0.1f), 0.4f);
            float dx = 2.7f, dz = -HD + 0.03f;
            Block("Slab", door, new Vector3(dx, 1.05f, dz), new Vector3(0.92f, 2.1f, 0.05f), doorMat);
            Block("FrameL", door, new Vector3(dx - 0.5f, 1.1f, dz), new Vector3(0.08f, 2.2f, 0.07f), doorFrame);
            Block("FrameR", door, new Vector3(dx + 0.5f, 1.1f, dz), new Vector3(0.08f, 2.2f, 0.07f), doorFrame);
            Block("FrameT", door, new Vector3(dx, 2.17f, dz), new Vector3(1.08f, 0.08f, 0.07f), doorFrame);
            Block("Handle", door, new Vector3(dx - 0.36f, 1.02f, dz + 0.05f), new Vector3(0.12f, 0.02f, 0.03f), Plain("Brass", new Color(0.8f, 0.6f, 0.3f), 0.7f, 1f));
        }

        static void BuildDomis()
        {
            var g = Group("Domis", props);
            // Drafting table in front of the window's left bays; the house model beside it under its own lamp.
            var table = PlaceModel("drafting_table", g, new Vector3(-2.35f, 0f, 2.55f), 180f);
            var sheet = Print(g, $"{ContentDir}/Domis/hero.jpg", Vector3.zero, Vector3.zero, 0.62f, 0.003f);
            sheet.transform.SetParent(table.transform, false);
            sheet.transform.localPosition = new Vector3(0.02f, 0.876f, 0.005f);
            sheet.transform.localRotation = Quaternion.Euler(90f + 18f, 0, 0) * Quaternion.Euler(0, 0, 180);
            sheet.transform.SetParent(g, true);
            var phone = PlaceModel("phone", table.transform, new Vector3(-0.4f, 0.797f, 0.238f), Quaternion.Euler(18f, 0, 0));
            phone.transform.SetParent(g, true);
            var phoneScreen = Display(phone, "Domis/phone.jpg", brightness: 1.3f);

            var side = Place("side_table_tall_01", g, new Vector3(-1.3f, 0, 2.6f), -10f);
            SitOn(side, 0f);
            float top = BoundsOf(side).max.y;
            var house = PlaceModel("domis_house", g, new Vector3(-1.3f, 0f, 2.6f), 200f, 0.95f);
            SitOn(house, top);

            var lamp = Practical("Domis_HouseLamp", g, new Vector3(-1.4f, top + 0.8f, 2.35f), new Color(1f, 0.66f, 0.38f), 1.4f, 2.2f,
                LightType.Spot, BoundsOf(house).center, 46f);
            Pool("Domis_Pool", g, new Vector3(-2.3f, 0.9f, 2.3f), 1.4f);
            stationAccent["domis"] = lamp;
            stationScreen["domis"] = phoneScreen;
            Remember("domis", table, side, house);
        }

        static void BuildTaste()
        {
            var g = Group("Taste", props);
            float wx = -HW;
            // Off hours, against the left wall: a low credenza with the turntable, records and games above, the scarf on a hook.
            var cred = PlaceModel("credenza", g, new Vector3(wx + 0.25f, 0f, 1.45f), 90f);
            float top = BoundsOf(cred).max.y;
            var deck = PlaceModel("turntable", g, new Vector3(wx + 0.27f, 0f, 1.0f), 90f);
            SitOn(deck, top);
            var platter = FindChild(deck, "Platter");
            if (platter) platter.gameObject.AddComponent<Spin>().degreesPerSecond = 200f;
            var console = Place("gaming_console", g, new Vector3(wx + 0.26f, 0, 1.9f), 90f, 0.9f);
            SitOn(console, top);

            var ledgeMat = Plain("Ledge", new Color(0.12f, 0.08f, 0.05f), 0.5f);
            float l1 = 1.22f, l2 = 1.72f, cz = 1.45f;
            Block("LedgeRecords", g, new Vector3(wx + 0.05f, l1, cz), new Vector3(0.09f, 0.02f, 1.2f), ledgeMat);
            Block("LedgeRecordsLip", g, new Vector3(wx + 0.093f, l1 + 0.025f, cz), new Vector3(0.012f, 0.05f, 1.2f), ledgeMat);
            Block("LedgeGames", g, new Vector3(wx + 0.05f, l2, cz), new Vector3(0.09f, 0.02f, 1.0f), ledgeMat);
            Block("LedgeGamesLip", g, new Vector3(wx + 0.093f, l2 + 0.02f, cz), new Vector3(0.012f, 0.04f, 1.0f), ledgeMat);
            // Covers face the room (+x), tops resting back against the wall.
            var lean = Quaternion.Euler(0, -90, 0) * Quaternion.Euler(8, 0, 0);
            Album(g, "Albums/motm2_front.jpg", new Vector3(wx + 0.055f, l1 + 0.165f, cz - 0.4f), lean);
            Album(g, "Albums/lgseo_front.jpg", new Vector3(wx + 0.055f, l1 + 0.165f, cz), lean);
            Album(g, "Albums/reanimation_front.jpg", new Vector3(wx + 0.055f, l1 + 0.165f, cz + 0.4f), lean);
            for (int i = 0; i < 3; i++)
                GameCase(g, $"Games/game_{i + 1}.jpg", new Vector3(wx + 0.052f, l2 + 0.105f, cz - 0.3f + i * 0.3f), lean);

            PlaceModel("scarf", g, new Vector3(wx, 2.05f, 2.45f), -90f);
            var plant = Place("potted_plant_02", g, new Vector3(wx + 0.45f, 0, HD - 0.45f), 30f, 0.85f);
            SitOn(plant, 0f);

            var wash = Practical("Taste_Wash", g, new Vector3(wx + 1.0f, RoomH - 0.15f, cz), new Color(1f, 0.7f, 0.46f), 1.5f, 3f,
                LightType.Spot, new Vector3(wx, 1.35f, cz), 62f);
            stationAccent["taste"] = wash;
            Remember("taste", cred);
        }

        static void BuildMemoryCare()
        {
            var g = Group("MemoryCare", props);
            float wx = -HW, cz = -1.45f;
            // Like the station: the armchair faces a wide screen, the driving wheel on a low table between them.
            var screenModel = PlaceModel("monitor", g, new Vector3(wx + 0.27f, 1.42f, cz), 90f, 2.0f);
            var screen = Display(screenModel, "MemoryCare/kitten.jpg", brightness: 1.6f);
            var chair = Place("mid_century_lounge_chair", g, new Vector3(wx + 1.75f, 0, cz), -90f);
            SitOn(chair, 0f);
            var table = Place("side_table_01", g, new Vector3(wx + 0.7f, 0, cz), 0f, 0.95f);
            SitOn(table, 0f);
            float top = BoundsOf(table).max.y;
            var wheel = PlaceModel("steering_wheel", g, new Vector3(wx + 0.74f, 0f, cz), 90f, 0.85f);
            SitOn(wheel, top);
            var pucks = PlaceModel("haptic_pucks", g, new Vector3(wx + 1.25f, 0f, cz), 90f, 0.85f);
            // The station itself, framed on the wall beside the screen.
            var photo = PlaceModel("frame_wall", g, new Vector3(wx + 0.02f, 1.12f, cz + 1.35f), 90f, 1.15f);
            FramePhoto(photo, "MemoryCare/station.jpg");

            var glow = Practical("Memory_Glow", g, screenModel.transform.position + new Vector3(0.6f, 0, 0), new Color(0.85f, 0.8f, 1f), 0.7f, 3f);
            glow.shadows = LightShadows.None;
            screen.glow = glow;
            screen.glowIntensity = 0.7f;
            Pool("Memory_Pool", g, new Vector3(wx + 1.6f, 0.6f, cz), 1.3f, 48f);
            stationAccent["memory-care"] = glow;
            stationScreen["memory-care"] = screen;
            Remember("memory-care", chair, screenModel, table, pucks);
        }

        static void BuildVirdio()
        {
            var g = Group("Virdio", props);
            float wx = HW, cz = -1.45f;
            // The old set on a nightstand against the right wall; the workout happens on the floor in front of it.
            var stand = Place("ClassicNightstand_01", g, new Vector3(wx - 0.24f, 0, cz), -90f);
            SitOn(stand, 0f);
            float top = BoundsOf(stand).max.y;
            var tv = Place("Television_01", g, new Vector3(wx - 0.3f, 0, cz), -90f);
            SitOn(tv, top);
            // Glass measured with EsperProbe.DepthMap: centre (0.0625, 0.257), 0.36 x 0.27 m, edge z 0.172, bulge 0.02.
            var tvScreen = CrtFace(tv, "Virdio_TV", $"{ContentDir}/Virdio/tv_class.jpg",
                new Vector3(0.0625f, 0.257f, 0.172f), new Vector2(0.355f, 0.268f), 0.02f);
            var tvMat = tvScreen.GetComponent<MeshRenderer>().sharedMaterial;
            tvMat.SetFloat("_Mono", 0f);
            tvMat.SetColor("_Tint", new Color(1f, 0.95f, 0.92f));
            tvMat.SetFloat("_Brightness", 2.0f);

            var mat = PlaceModel("exercise_mat", g, new Vector3(wx - 1.7f, 0.0f, cz), 90f);
            var bells = PlaceModel("kettlebells", g, new Vector3(wx - 1.6f, 0f, cz + 0.75f), -20f);
            var phoneStand = PlaceModel("phone_stand", g, new Vector3(wx - 0.75f, 0.0f, cz + 0.42f), -105f);
            var phone = PlaceModel("phone", g, new Vector3(wx - 0.76f, 0.052f, cz + 0.42f),
                Quaternion.Euler(0, -105, 0) * Quaternion.Euler(65, 0, 0) * Quaternion.Euler(0, 90, 0));
            Display(phone, "Virdio/phone_rot.jpg", brightness: 1.4f);
            var laptop = PlaceModel("laptop", g, new Vector3(wx - 0.75f, 0f, cz - 0.45f), -75f);
            Display(laptop, "Virdio/laptop.jpg", brightness: 1.5f);

            var glow = Practical("Virdio_TVGlow", g, tvScreen.transform.position + new Vector3(-0.5f, 0, 0), new Color(1f, 0.55f, 0.5f), 0.4f, 2.6f);
            glow.shadows = LightShadows.None;
            tvScreen.GetComponent<CrtScreen>().glow = glow;
            tvScreen.GetComponent<CrtScreen>().glowIntensity = 0.4f;
            Pool("Virdio_Pool", g, new Vector3(wx - 1.3f, 0f, cz), 1.6f, 55f);
            stationAccent["virdio"] = glow;
            stationScreen["virdio"] = tvScreen.GetComponent<CrtScreen>();
            Remember("virdio", stand, tv, mat, phoneStand, laptop);
        }

        static void BuildWafflings()
        {
            var g = Group("Wafflings", props);
            float fz = -HD, cx = -2.4f;
            // A bookshelf by the door: a few side projects kept like souvenirs, with room around them.
            var shelf = Place("wooden_bookshelf_worn", g, new Vector3(cx, 0, fz + 0.3f), 0f);
            SitOn(shelf, 0f);
            var sb = BoundsOf(shelf);
            var levels = ShelfLevels(shelf, sb.center.x, sb.center.z);
            float L(int i) => levels.Count > i ? levels[i] : sb.min.y + 0.4f * (i + 1);
            float zc = sb.center.z;

            var orca = PlaceModel("frame_landscape", g, new Vector3(cx - 0.3f, 0, zc), 5f);
            SitOn(orca, L(2));
            FramePhoto(orca, "Wafflings/orca_booth.jpg");
            var hand = PlaceModel("frame_portrait", g, new Vector3(cx + 0.3f, 0, zc), -5f);
            SitOn(hand, L(2));
            FramePhoto(hand, "Wafflings/mighty_hand.jpg");
            var cassette = Place("portable_cassette_player", g, new Vector3(cx - 0.2f, 0, zc + 0.02f), 20f);
            SitOn(cassette, L(3));
            var pot = Place("brass_pot_01", g, new Vector3(cx + 0.28f, 0, zc), -30f, 0.75f);
            SitOn(pot, L(3));
            var books = Place("book_encyclopedia_set_01", g, new Vector3(cx - 0.15f, 0, zc), 0f, 0.9f);
            SitOn(books, L(4));

            var lamp = Practical("Wafflings_Light", g, new Vector3(cx, L(2) + 0.32f, zc + 0.1f), new Color(1f, 0.62f, 0.34f), 0.45f, 1.2f);
            lamp.shadows = LightShadows.Soft;
            Pool("Wafflings_Pool", g, new Vector3(cx, 1.2f, fz + 0.4f), 1.3f, 50f);
            stationAccent["wafflings"] = lamp;
            Remember("wafflings", shelf);
        }

        static void Album(Transform parent, string content, Vector3 pos, Quaternion rot)
        {
            var go = new GameObject("Album");
            go.transform.SetParent(parent, false);
            go.transform.SetPositionAndRotation(pos, rot);
            var tex = UnityEditor.AssetDatabase.LoadAssetAtPath<Texture2D>($"{ContentDir}/{content}");
            var m = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            m.SetTexture("_BaseMap", tex);
            m.SetFloat("_Smoothness", 0.35f);
            m.SetFloat("_Cull", 0f);
            var face = new GameObject("Cover");
            face.transform.SetParent(go.transform, false);
            face.transform.localPosition = new Vector3(0, 0, -0.0025f);
            face.transform.localScale = new Vector3(0.31f, 0.31f, 1);
            face.AddComponent<MeshFilter>().sharedMesh = Resources.GetBuiltinResource<Mesh>("Quad.fbx");
            face.AddComponent<MeshRenderer>().sharedMaterial = SaveMat(m, "Album_" + System.IO.Path.GetFileNameWithoutExtension(content));
            Block("Board", go.transform, Vector3.zero, new Vector3(0.31f, 0.31f, 0.004f), Plain("Sleeve", new Color(0.18f, 0.16f, 0.14f), 0.3f), isStatic: false);
        }

        static void GameCase(Transform parent, string content, Vector3 pos, Quaternion rot)
        {
            var go = new GameObject("GameCase");
            go.transform.SetParent(parent, false);
            go.transform.SetPositionAndRotation(pos, rot);
            var tex = UnityEditor.AssetDatabase.LoadAssetAtPath<Texture2D>($"{ContentDir}/{content}");
            var m = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            m.SetTexture("_BaseMap", tex);
            m.SetFloat("_Smoothness", 0.75f);
            var face = new GameObject("Cover");
            face.transform.SetParent(go.transform, false);
            face.transform.localPosition = new Vector3(0, 0, -0.0076f);
            face.transform.localScale = new Vector3(0.135f, 0.19f, 1);
            face.AddComponent<MeshFilter>().sharedMesh = Resources.GetBuiltinResource<Mesh>("Quad.fbx");
            face.AddComponent<MeshRenderer>().sharedMaterial = SaveMat(m, "Game_" + System.IO.Path.GetFileNameWithoutExtension(content));
            Block("Case", go.transform, Vector3.zero, new Vector3(0.137f, 0.192f, 0.014f), Plain("GameCaseShell", new Color(0.05f, 0.08f, 0.15f), 0.6f), isStatic: false);
        }
    }
}
