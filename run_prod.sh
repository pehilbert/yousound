#!/bin/bash
cd ~/yousound
git pull origin main
npm install
cd view
npm install
cd ../backend
npm install
cd ..
npm run prod
