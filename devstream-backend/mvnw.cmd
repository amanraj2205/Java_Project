@REM Convenient Maven Wrapper for DevStream Spring Boot Backend
@echo off
set "IDEA_MAVEN=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2024.3\plugins\maven\lib\maven3\bin\mvn.cmd"

if exist "%IDEA_MAVEN%" (
    call "%IDEA_MAVEN%" %*
) else (
    mvn %*
) 