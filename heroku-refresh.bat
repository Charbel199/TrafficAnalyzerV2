@echo off
title Heroku Refresh

echo Starting ...

:loop
echo Refreshing ...
curl https://traffic-analyzer-v2.herokuapp.com/stop
TIMEOUT /T 3
curl https://traffic-analyzer-v2.herokuapp.com/run/6

TIMEOUT 1440
goto loop