# mv apples ../
# mv node_modules ../


counter=0
for i in ../Releases/*; do
    ((counter++))
done
# echo "Number of folders in Releases: $counter"



mkdir -p ../Releases/R$counter

# Copy all files except the ones in .gitignore
rsync -a --exclude-from=.gitignore . ../Releases/R$counter
# cp -r ./* ../Releases/R$counter


# mv  ../apples ./
# mv  ../node_modules ./

echo "R$counter"