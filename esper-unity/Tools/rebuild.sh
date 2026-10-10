#!/usr/bin/env bash
# Full pipeline: scene -> GI bake -> review shots -> WebGL build into ../public/esper
set -e
cd "$(dirname "$0")/.."
Tools/unity.sh Esper.EditorTools.EsperBake.BuildBakeOnly bake
Tools/unity.sh Esper.EditorTools.EsperShots.Capture cap
[ "$1" = "--web" ] && UNITY_ARGS="-buildTarget WebGL" Tools/unity.sh Esper.EditorTools.EsperWebBuild.Build web
exit 0
