using UnityEngine;

namespace Esper.Live
{
    /// Each station is idle until selected, then in use. Items opt in with spec.station + spec.when
    /// ("idle" or "active"); screens swap through LiveDisplayState.
    public static class StationStates
    {
        /// The station currently in use, or null.
        public static string Active;

        public static bool Visible(string station, string when)
        {
            if (string.IsNullOrEmpty(station) || string.IsNullOrEmpty(when)) return true;
            bool active = Active == station;
            return when == "active" ? active : !active;
        }

        public static void Set(Transform root, string station)
        {
            Active = station;
            var props = root.Find("Props");
            if (!props) return;
            foreach (var li in props.GetComponentsInChildren<LiveItem>(true))
                if (!string.IsNullOrEmpty(li.when))
                    li.gameObject.SetActive(Visible(li.station, li.when));
        }
    }
}
