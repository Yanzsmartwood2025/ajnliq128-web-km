for file in components/GhostFibers.jsx components/RippleDistortion.jsx components/WebThreads.jsx; do
  sed -i 's/export default \(GhostFibers\|RippleDistortion\|WebThreads\);/\nexport { \1 };\nexport default \1;/' $file
done
