#!/usr/bin/env bash
# Usage: Tools/unity.sh <Namespace.Class.Method> [logname]
U="/c/Program Files/Unity/Hub/Editor/6000.5.10f1/Editor/Unity.exe"
LOG="Logs/${2:-batch}.log"
"$U" -batchmode -quit -projectPath "E:/Documents/hridaew-portfolio/esper-unity" -executeMethod "$1" -logFile "$LOG" ${UNITY_ARGS}
code=$?
grep -E "error CS|Shader error|\[esper\]|Exception|Error:|ERROR" "$LOG" | grep -v "^UnityEngine" | head -60
echo "exit $code"
