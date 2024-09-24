#!/bin/bash
cd ~/yousound
git pull origin main
npm install
cd frontend
npm install
cd ../server
npm install
cd ..
npm run prod
