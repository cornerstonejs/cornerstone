cd docs
rm -rf _book
mkdir -p _book
gitbook install
gitbook build
cp assets/CNAME _book/CNAME
cd _book

# Set User
git config --global user.email "erik.sweed@gmail.com"
git config --global user.name "swederik"

git init
git add -A
git commit -m 'Update compiled GitBook (this commit is automatic)'
git push -f git@github.com:cornerstonejs/cornerstone.git master:gh-pages
