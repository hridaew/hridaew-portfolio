using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    /// The rooms's stations: each a piece of work, staged as a corner of a life.
    /// Room: x -3..3 (right wall +x), z -2.6..2.6 (window wall +z). The door, and the overview, are at -z.
    public static partial class EsperBuilder
    {
        public static readonly Dictionary<string, Bounds> stationBounds = new();
        public static readonly Dictionary<string, Light> stationAccent = new();
        public static readonly Dictionary<string, CrtScreen> stationScreen = new();

        static void Remember(string id, params GameObject[] objs)
        {
            var b = BoundsOf(objs[0]);
            foreach (var o in objs) b.Encapsulate(BoundsOf(o));
            stationBounds[id] = b;
        }

        static void BuildRoomDressing()
        {
            float hw = RoomW / 2, hd = RoomD / 2;
            var room = Group("Room", props);

            var fan = Place("ceiling_fan", room, new Vector3(0.1f, 0, 0.1f), 0f);
            fan.transform.position += Vector3.up * (RoomH - BoundsOf(fan).max.y);
            fan.AddComponent<Spin>().degreesPerSecond = 55f;

            // The clock over the ESPER desk, on the strip of wall right of the window.
            Place("wall_clock", room, new Vector3(2.64f, 2.15f, hd - 0.03f), 180f);

            // A bare bulb on a pull chain over the Memory Care corner — the low warm light by the armchair.
            var socket = Place("pull_chain_light_socket", room, new Vector3(-2.3f, 0, 0.9f), 0f);
            socket.transform.position += Vector3.up * (RoomH - BoundsOf(socket).max.y);
            var bulb = Place("lightbulb_01", room, new Vector3(-2.3f, 0, 0.9f), 0f, 1f, new Vector3(180, 0, 0));
            bulb.transform.position += Vector3.up * (BoundsOf(socket).min.y - BoundsOf(bulb).max.y + 0.01f);

            // Cast-iron radiator under the window, the sort that knocks at night.
            var rad = Group("Radiator", room);
            var radMat = Surface("RadiatorPaint", "painted_metal_shutter", 3f, new Color(0.55f, 0.52f, 0.46f), 0.6f);
            float rx0 = -0.55f, rx1 = 1.35f, rz = hd - 0.13f;
            for (float x = rx0; x <= rx1; x += 0.062f)
            {
                Block("Fin", rad, new Vector3(x, 0.42f, rz), new Vector3(0.04f, 0.56f, 0.15f), radMat);
            }
            Block("RadTop", rad, new Vector3((rx0 + rx1) / 2, 0.71f, rz), new Vector3(rx1 - rx0 + 0.05f, 0.025f, 0.08f), radMat);
            Block("RadBottom", rad, new Vector3((rx0 + rx1) / 2, 0.15f, rz), new Vector3(rx1 - rx0 + 0.05f, 0.025f, 0.08f), radMat);
            for (int i = 0; i < 2; i++)
            {
                float x = i == 0 ? rx0 + 0.04f : rx1 - 0.04f;
                Block("RadFoot", rad, new Vector3(x, 0.07f, rz), new Vector3(0.05f, 0.14f, 0.05f), radMat);
            }
            Block("RadPipe", rad, new Vector3(rx1 + 0.09f, 0.08f, rz + 0.03f), new Vector3(0.035f, 0.16f, 0.035f), radMat);

            // A worn rug under the drafting table.
            var rugMat = Surface("Rug", "dirty_carpet", 0.9f, new Color(0.42f, 0.36f, 0.3f), 0.2f);
            Block("Rug", room, new Vector3(-0.75f, 0.004f, 0.75f), new Vector3(2.0f, 0.008f, 1.5f), rugMat, rot: Quaternion.Euler(0, 6, 0));
        }

        static void BuildVirdio()
        {
            float hw = RoomW / 2;
            var g = Group("Virdio", props);
            // The old set on a nightstand against the left wall; the workout happens on the floor in front of it.
            var stand = Place("ClassicNightstand_01", g, new Vector3(-hw + 0.24f, 0, -0.75f), 90f);
            SitOn(stand, 0f);
            float top = BoundsOf(stand).max.y;
            var tv = Place("Television_01", g, new Vector3(-hw + 0.3f, 0, -0.75f), 90f);
            SitOn(tv, top);
            // Glass measured with EsperProbe.DepthMap: centre (0.0625, 0.257), 0.36 x 0.27 m, edge z 0.172, bulge 0.02.
            var tvScreen = CrtFace(tv, "Virdio_TV", $"{ContentDir}/Virdio/tv_class.jpg",
                new Vector3(0.0625f, 0.257f, 0.172f), new Vector2(0.355f, 0.268f), 0.02f);
            var tvMat = tvScreen.GetComponent<MeshRenderer>().sharedMaterial;
            tvMat.SetFloat("_Mono", 0f);
            tvMat.SetColor("_Tint", new Color(1f, 0.95f, 0.92f));
            tvMat.SetFloat("_Brightness", 2.1f);
            var console = Place("gaming_console", g, new Vector3(-hw + 0.22f, 0, -0.75f), 90f, 0.9f);
            SitOn(console, SurfaceY(stand, new Vector3(-hw + 0.22f, top - 0.05f, -0.75f)));

            // Mat out into the room; at its head, the phone on its stand and the laptop streaming the class.
            var mat = PlaceModel("exercise_mat", g, new Vector3(-1.55f, 0.0f, -0.75f), -90f);
            var bells = PlaceModel("kettlebells", g, new Vector3(-1.35f, 0f, -0.05f), 20f);
            var phoneStand = PlaceModel("phone_stand", g, new Vector3(-2.38f, 0.0f, -0.5f), 75f);
            var phone = PlaceModel("phone", g, new Vector3(-2.37f, 0.052f, -0.5f),
                Quaternion.Euler(0, 75, 0) * Quaternion.Euler(65, 0, 0) * Quaternion.Euler(0, 90, 0));
            Display(phone, "Virdio/phone_rot.jpg", brightness: 1.4f);
            var laptop = PlaceModel("laptop", g, new Vector3(-2.38f, 0f, -1.1f), 105f);
            Display(laptop, "Virdio/laptop.jpg", brightness: 1.5f);

            var glow = Practical("Virdio_TVGlow", g, tvScreen.transform.position + new Vector3(0.45f, 0, 0), new Color(1f, 0.42f, 0.4f), 0.35f, 2.6f);
            glow.shadows = LightShadows.None;
            tvScreen.GetComponent<CrtScreen>().glow = glow;
            tvScreen.GetComponent<CrtScreen>().glowIntensity = 0.35f;
            stationAccent["virdio"] = glow;
            stationScreen["virdio"] = tvScreen.GetComponent<CrtScreen>();
            Remember("virdio", stand, tv, mat, phoneStand, laptop);
        }

        static void BuildDomis()
        {
            var g = Group("Domis", props);
            // Drafting table facing the window; the house model on a tall side table beside it, under its own lamp.
            var table = PlaceModel("drafting_table", g, new Vector3(-0.95f, 0f, 0.95f), 172f);
            var sheet = Print(g, $"{ContentDir}/Domis/hero.jpg", Vector3.zero, Vector3.zero, 0.62f, 0.003f);
            // Lay the sheet on the tilted board (18 degrees, ledge toward the room).
            sheet.transform.SetParent(table.transform, false);
            sheet.transform.localPosition = new Vector3(0.02f, 0.876f, 0.005f);
            sheet.transform.localRotation = Quaternion.Euler(90f + 18f, 0, 0) * Quaternion.Euler(0, 0, 180);
            sheet.transform.SetParent(g, true);

            var side = Place("side_table_tall_01", g, new Vector3(-0.1f, 0, 1.05f), -10f);
            SitOn(side, 0f);
            float top = BoundsOf(side).max.y;
            var house = PlaceModel("domis_house", g, new Vector3(-0.1f, 0f, 1.05f), 200f, 0.95f);
            SitOn(house, top);
            // The phone rests on the board's pencil ledge beside the printed sheet.
            var phone = PlaceModel("phone", table.transform, new Vector3(-0.4f, 0.797f, 0.238f), Quaternion.Euler(18f, 0, 0));
            phone.transform.SetParent(g, true);
            var phoneScreen = Display(phone, "Domis/phone.jpg", brightness: 1.3f);

            var lamp = Practical("Domis_HouseLamp", g, new Vector3(-0.2f, top + 0.75f, 0.85f), new Color(1f, 0.66f, 0.38f), 1.6f, 2.2f,
                LightType.Spot, BoundsOf(house).center, 48f);
            stationAccent["domis"] = lamp;
            stationScreen["domis"] = phoneScreen;
            Remember("domis", table, side, house);
        }

        static void BuildMemoryCare()
        {
            float hw = RoomW / 2;
            var g = Group("MemoryCare", props);
            // Arranged like the station: the armchair faces the screen, the wheel on a low table between them.
            var chair = Place("mid_century_lounge_chair", g, new Vector3(-1.75f, 0, 1.55f), -105f);
            SitOn(chair, 0f);
            var plant = Place("potted_plant_02", g, new Vector3(-2.62f, 0, 2.3f), 30f, 0.85f);
            SitOn(plant, 0f);
            var disp = PlaceModel("round_display", g, new Vector3(-hw + 0.06f, 1.3f, 1.45f), 90f, 0.9f);
            var screen = Display(disp, "MemoryCare/kitten.jpg", crt: true, brightness: 1.5f);
            var dm = FindChild(disp, "Screen").GetComponent<MeshRenderer>().sharedMaterial;
            dm.SetFloat("_Curvature", 0.02f);
            dm.SetFloat("_Scanlines", 180f);
            dm.SetFloat("_Mask", 0.12f);
            dm.SetFloat("_Brightness", 2.2f);

            var table = Place("side_table_01", g, new Vector3(-2.55f, 0, 1.45f), 0f, 0.95f);
            SitOn(table, 0f);
            float top = BoundsOf(table).max.y;
            var wheel = PlaceModel("steering_wheel", g, new Vector3(-2.5f, 0f, 1.45f), 90f, 0.85f);
            SitOn(wheel, top);
            var frame = PlaceModel("frame_landscape", g, new Vector3(-2.68f, 0f, 1.12f), 70f, 0.9f);
            SitOn(frame, top);
            FramePhoto(frame, "MemoryCare/resident_wheel.jpg");
            var pucks = PlaceModel("haptic_pucks", g, new Vector3(-2.1f, 0f, 1.5f), -90f, 0.85f);

            var glow = Practical("Memory_Glow", g, disp.transform.position + new Vector3(0.45f, -0.05f, 0), new Color(1f, 0.82f, 0.9f), 0.45f, 2.4f);
            glow.shadows = LightShadows.None;
            screen.glow = glow;
            screen.glowIntensity = 0.45f;
            stationAccent["memory-care"] = glow;
            stationScreen["memory-care"] = screen;
            Remember("memory-care", chair, disp, table, pucks);
        }

        static void BuildWafflings()
        {
            float hw = RoomW / 2;
            var g = Group("Wafflings", props);
            // A worn bookshelf by the door: side projects kept like souvenirs.
            var shelf = Place("wooden_bookshelf_worn", g, new Vector3(hw - 0.3f, 0, -0.85f), -90f);
            SitOn(shelf, 0f);
            var sb = BoundsOf(shelf);
            float x = sb.center.x;
            var levels = ShelfLevels(shelf, x, sb.center.z);
            Debug.Log($"[esper] shelf levels {string.Join(", ", levels)}");
            float L(int i) => levels.Count > i ? levels[i] : sb.min.y + 0.4f * (i + 1);
            float zc = sb.center.z;

            // Top: the boombox. Then: Orca (booth photo), Savor (the Mighty Hand), Recorder (cassette), butter chicken (the pot).
            var boom = Place("boombox", g, new Vector3(x, 0, zc), -90f, 0.75f);
            SitOn(boom, L(0));
            var orca = PlaceModel("frame_landscape", g, new Vector3(x, 0, zc + 0.25f), -95f);
            SitOn(orca, L(2));
            FramePhoto(orca, "Wafflings/orca_booth.jpg");
            var hand = PlaceModel("frame_portrait", g, new Vector3(x, 0, zc - 0.28f), -85f);
            SitOn(hand, L(2));
            FramePhoto(hand, "Wafflings/mighty_hand.jpg");
            var cassette = Place("portable_cassette_player", g, new Vector3(x - 0.02f, 0, zc + 0.15f), -110f);
            SitOn(cassette, L(1));
            var pot = Place("brass_pot_01", g, new Vector3(x, 0, zc - 0.25f), -60f, 0.8f);
            SitOn(pot, L(1));
            var books = Place("binoculars", g, new Vector3(x, 0, zc + 0.2f), -120f);
            SitOn(books, L(3));
            var projector = Place("filmstrip_projector_8mm", g, new Vector3(x, 0, zc - 0.25f), -60f);
            SitOn(projector, L(3));
            var enc = Place("book_encyclopedia_set_01", g, new Vector3(x, 0, zc + 0.12f), -90f);
            SitOn(enc, L(4));
            var enc2 = Place("book_encyclopedia_set_01", g, new Vector3(x, 0, zc - 0.32f), -96f, 0.9f);
            SitOn(enc2, L(4));
            var notebook = Place("binder_notebook", g, new Vector3(x, 0, zc - 0.02f), -80f);
            SitOn(notebook, L(4));
            var box = Place("cardboard_box_01", g, new Vector3(x, 0, zc + 0.25f), -84f, 0.75f);
            SitOn(box, L(6));
            var enc3 = Place("book_encyclopedia_set_01", g, new Vector3(x, 0, zc - 0.25f), -90f);
            SitOn(enc3, L(5));
            var camera = Place("vintage_video_camera", g, new Vector3(x, 0, zc + 0.3f), -130f, 1.2f);
            SitOn(camera, L(5));
            var shelfGlow = Practical("Wafflings_Inner", g, new Vector3(x - 0.08f, L(2) + 0.3f, zc), new Color(1f, 0.62f, 0.32f), 0.35f, 1.1f);
            shelfGlow.shadows = LightShadows.Soft;

            var lamp = Practical("Wafflings_Sconce", g, new Vector3(hw - 0.12f, 2.05f, -1.75f), new Color(1f, 0.6f, 0.3f), 0.9f, 2.4f,
                LightType.Spot, sb.center + Vector3.up * 0.2f, 70f);
            stationAccent["wafflings"] = lamp;
            Remember("wafflings", shelf);
        }

        static void BuildTaste()
        {
            float hw = RoomW / 2, hd = RoomD / 2;
            var g = Group("Taste", props);
            // The scarf on a hook by the window: the one red thing in the room.
            PlaceModel("scarf", g, new Vector3(-1.95f, 1.95f, hd), 180f);

            // A milk crate of records by the TV, three leaning out front.
            var crate = Place("cardboard_box_01", g, new Vector3(-2.6f, 0, -1.85f), 80f);
            SitOn(crate, 0f);
            var cb = BoundsOf(crate);
            var sleeveMat = Plain("Sleeve", new Color(0.18f, 0.16f, 0.14f), 0.3f);
            for (int i = 0; i < 9; i++)
            {
                float t = i / 8f;
                Block("Sleeve", g, new Vector3(cb.center.x - 0.08f + t * 0.16f, cb.min.y + 0.24f, cb.center.z + (i % 2) * 0.01f),
                    new Vector3(0.004f, 0.31f, 0.31f), sleeveMat, isStatic: false, rot: Quaternion.Euler(0, 75, 8 - t * 16));
            }
            Album(g, "Albums/reanimation_front.jpg", new Vector3(-2.3f, 0.155f, -1.72f), Quaternion.Euler(0, -105, 0) * Quaternion.Euler(12, 0, 0));
            Album(g, "Albums/lgseo_front.jpg", new Vector3(-2.45f, 0.155f, -1.45f), Quaternion.Euler(0, -80, 0) * Quaternion.Euler(14, 0, 0));
            Album(g, "Albums/motm2_front.jpg", new Vector3(-2.75f, 0.155f, -1.4f), Quaternion.Euler(0, -55, 0) * Quaternion.Euler(10, 0, 0));

            // Half-Life: a crowbar leaning by the door. Arsenal again: a ball under the ESPER desk.
            Place("crowbar_01", g, new Vector3(hw - 0.06f, 0.28f, -1.55f), 0, 1f, new Vector3(0, -90, -12));
            var ball = Place("dirty_football", g, new Vector3(2.35f, 0, 0.55f), 40f);
            SitOn(ball, 0f);
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
    }
}
