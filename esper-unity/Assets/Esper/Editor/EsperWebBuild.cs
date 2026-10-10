using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Esper.EditorTools
{
    /// WebGL player build into the Next.js site's public/esper folder.
    public static class EsperWebBuild
    {
        static string Output => Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "public", "esper"));

        public static void Build()
        {
            PlayerSettings.companyName = "Hridae Walia";
            PlayerSettings.productName = "ESPER";
            PlayerSettings.colorSpace = ColorSpace.Linear;
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
            PlayerSettings.WebGL.decompressionFallback = true;
            PlayerSettings.WebGL.dataCaching = true;
            PlayerSettings.WebGL.exceptionSupport = WebGLExceptionSupport.None;
            PlayerSettings.WebGL.nameFilesAsHashes = false;
            PlayerSettings.WebGL.showDiagnostics = false;
            PlayerSettings.runInBackground = false;
            PlayerSettings.SetManagedStrippingLevel(UnityEditor.Build.NamedBuildTarget.WebGL, ManagedStrippingLevel.Medium);
            PlayerSettings.SplashScreen.show = false;

            if (Directory.Exists(Output)) Directory.Delete(Output, true);
            var options = new BuildPlayerOptions
            {
                scenes = new[] { EsperBuilder.ScenePath },
                locationPathName = Output,
                target = BuildTarget.WebGL,
                options = BuildOptions.None,
            };
            var report = BuildPipeline.BuildPlayer(options);
            Debug.Log($"[esper] webgl build {report.summary.result} size={report.summary.totalSize / (1024 * 1024)}MB time={report.summary.totalTime}");
            if (report.summary.result != BuildResult.Succeeded) EditorApplication.Exit(1);
        }
    }
}
