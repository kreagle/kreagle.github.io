echo "Removing old output" &&
rm -rf output &&
echo "creating new output" &&
mkdir output && 
echo "output deleted" &&
node scripts/render.mjs kristinreagle.json output/pdf_output.html &&
node scripts/render.mjs kristinreagle.json index.html 