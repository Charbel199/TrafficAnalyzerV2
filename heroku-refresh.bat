@echo off
title Heroku Refresh
echo Starting ...
curl https://traffic-analyzer-v2.herokuapp.com/stop
TIMEOUT /T 3
curl https://traffic-analyzer-v2.herokuapp.com/run/6
pause
