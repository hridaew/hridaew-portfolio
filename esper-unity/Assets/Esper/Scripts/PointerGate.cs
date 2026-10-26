namespace Esper
{
    /// Unity's WebGL input reads the mouse for the whole page. The page reports when the pointer is over its
    /// interface (tab bar, dossier, Studio panels) so the room ignores hovers and clicks meant for the UI.
    public static class PointerGate
    {
        public static bool OverUi;
    }
}
