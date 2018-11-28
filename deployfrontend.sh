rsync -r pages/ docs/
rsync build/contracts/Campaign.json docs/ 
git add .
git commit -m "adding frontend files to Github pages"
git push