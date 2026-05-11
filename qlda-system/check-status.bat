@echo off
timeout /t 5 /nobreak
echo === Checking Docker Status ===
docker-compose ps
echo.
echo === Auth Service Logs (last 30 lines) ===
docker logs --tail 30 qlda-auth-service
echo.
echo === Test API Gateway ===
curl -v http://localhost:8080/api/auth/me 2>&1 | timeout /t 3
echo.
echo === Done ===
pause
