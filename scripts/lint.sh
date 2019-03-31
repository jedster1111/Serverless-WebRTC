yarn lint-css -q
return1=$?
echo "lint-css exited with code: $return1\n"

yarn lint-ts --quiet
return2=$?
echo "lint-ts exited with code: $return2\n"

if [ $return1 -eq 0 ] && [ $return2 -eq 0 ]
then
  return 0
else
  return 2
fi