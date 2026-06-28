#!/bin/bash

# Navigate to the correct directory just in case
cd /home/ronin/Documents/ClearTax/server

echo 'Running seedUsersRegular.ts...'
docker exec -it cleartax_nodejs node --experimental-strip-types src/seedUsersRegular.ts

echo -e '\nRunning seedTransactions.ts...'
docker exec -it cleartax_nodejs node --experimental-strip-types src/seedTransactions.ts

echo -e '\nRunning seedUsersCompany.ts...'
docker exec -it cleartax_nodejs node --experimental-strip-types src/seedUsersCompany.ts

echo -e '\nRunning seedProblems.ts...'
docker exec -it cleartax_nodejs node --experimental-strip-types src/seedProblems.ts

echo -e '\nAll seed scripts finished!'
