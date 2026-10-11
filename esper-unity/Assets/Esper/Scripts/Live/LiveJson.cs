using System.Globalization;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Esper.Live
{
    public static class LiveJson
    {
        static readonly JsonSerializerSettings Settings = new()
        {
            NullValueHandling = NullValueHandling.Ignore,
            DefaultValueHandling = DefaultValueHandling.Ignore,
            Culture = CultureInfo.InvariantCulture,
            FloatFormatHandling = FloatFormatHandling.DefaultValue,
            ContractResolver = new DefaultContractResolver(),
        };

        public static LiveSceneSpec Scene(string json) => JsonConvert.DeserializeObject<LiveSceneSpec>(json, Settings);
        public static string Scene(LiveSceneSpec spec, bool pretty = true) => JsonConvert.SerializeObject(spec, pretty ? Formatting.Indented : Formatting.None, Settings);
        /// Canonical compact form of one item: what the live applier diffs on.
        public static string Item(ItemSpec spec) => JsonConvert.SerializeObject(spec, Formatting.None, Settings);
        public static T Clone<T>(T o) => JsonConvert.DeserializeObject<T>(JsonConvert.SerializeObject(o, Settings), Settings);
    }
}
