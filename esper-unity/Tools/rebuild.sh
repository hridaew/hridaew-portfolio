#!/usr/bin/env bash
# Full pipeline: scene -> GI bake -> review shots -> WebGL build into ../public/esper
set -e
cd "$(dirname "$0")/.."
Tools/unity.sh Esper.EditorTools.EsperBake.BuildBakeOnly bake
Tools/unity.sh Esper.EditorTools.EsperShots.Capture cap
if [ "$1" = "--web" ]; then
  UNITY_ARGS="-buildTarget WebGL" Tools/unity.sh Esper.EditorTools.EsperWebBuild.Build web
  # The build replaces public/esper; restore the live spec the deployed page reads.
  mkdir -p ../public/esper/live && cp Live/scene.json ../public/esper/live/scene.json
fi
exit 0
