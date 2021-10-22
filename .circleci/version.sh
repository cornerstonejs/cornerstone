# reads version from package.json and sets prelease equal to Circle CI build number
if [ $CI ] && [ $CIRCLE_BUILD_NUM ]
then
	PACKAGE_VERSION=$(cat package.json \
		| grep version \
		| head -1 \
		| awk -F: '{ print $2 }' \
		| sed 's/[",]//g' \
		| tr -d '[[:space:]]')

	NEW_PACKAGE_VERSION=$(echo $PACKAGE_VERSION | sed -e "s/^\([0-9]*\.[0-9]*\.[0-9]*\-[a-z]*\).[0-9]*$/\1.$CIRCLE_BUILD_NUM/")
	echo "Found package version: $PACKAGE_VERSION"
	echo "Setting version to: $NEW_PACKAGE_VERSION"
	# uses npm-version to set version in package.json
	# see https://docs.npmjs.com/cli/version
	npm version $NEW_PACKAGE_VERSION --no-git-tag-version
	#
	git config credential.helper 'cache --timeout=120'
	git config user.email "danny.ri.brown@gmail.com"
	git config user.name "Daniel Brown"
	git add .
	git commit --allow-empty -m "Version Bump"
	# Push quietly to prevent showing the token in log
	# git push -q https://${GITHUB_TOKEN}@github.com/cornerstonejs/cornerstoneTools.git vNext
else
  	echo "Don't forget to update the build version!"
fi