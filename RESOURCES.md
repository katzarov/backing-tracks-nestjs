# Useful links and resources

## Docker

- https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
- https://snyk.io/blog/choosing-the-best-node-js-docker-image/
- https://blog.ghaiklor.com/2018/02/20/avoid-running-nodejs-as-pid-1-under-docker-images/
- https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
- https://github.com/krallin/tini#using-tini
- https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker#step-3-writing-the-dockerfile

## Redis(BullMQ)

- explore bull impl with redis insight https://www.youtube.com/watch?v=ppYSS6opUiQ

## WS / SSE

- websocket https://github.com/nestjs/nest/blob/master/sample/02-gateways/client/index.html
- https://github.com/nestjs/nest/tree/master/sample/28-sse/src
- https://docs.nestjs.com/techniques/server-sent-events

- like this user I was frustrated with the @Sse decorator, so I did not use it
- https://github.com/nestjs/nest/issues/12670
- https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server
- https://github.com/MohamedAlabasy/Nest.JS-Notification-Server-Sent-Event/blob/main/src/notification/notification.service.ts
- https://medium.com/@leonardoacrg.dev/nestjs-a-request-progress-tracker-using-sse-b9f2fded9d70

## TS

- https://blog.makerx.com.au/a-type-safe-event-emitter-in-node-js/

## JS

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters#the_difference_between_rest_parameters_and_the_arguments_object

## Yt-Dlp

a dump of some notes I had while implementing the feat.

COOKIE ISSUE THREAFD
https://github.com/yt-dlp/yt-dlp/issues/8227
https://github.com/yt-dlp/yt-dlp/issues/8227#issuecomment-1867184804

https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies

need to lock the cookie file so that multiple peocesses can read and write to it.
https://github.com/yt-dlp/yt-dlp/issues/5977
https://github.com/yt-dlp/yt-dlp/issues/5977#issuecomment-2123022028 not allowing to write back to the cookie could break future downloads - pukkandan is one of the main contributors
https://github.com/yt-dlp/yt-dlp/issues/8819

yt-dlp does lock
https://github.com/yt-dlp/yt-dlp/issues/2670
https://github.com/yt-dlp/yt-dlp/blob/164368610456e2d96b279f8b120dea08f7b1d74f/yt_dlp/utils/_utils.py#L1575
https://github.com/yt-dlp/yt-dlp/issues/393

yt-dlp does not lock when writting https://github.com/yt-dlp/yt-dlp/blob/164368610456e2d96b279f8b120dea08f7b1d74f/yt_dlp/cookies.py#L1300
so if i spawn multiple processes...
i need to impl locking or maybe do a PR in yt-dlp to flock this coookie or something

https://github.com/yt-dlp/yt-dlp/issues/5977
https://github.com/yt-dlp/yt-dlp/issues/8819
https://github.com/yt-dlp/yt-dlp/issues/1918
https://github.com/yt-dlp/yt-dlp/blob/164368610456e2d96b279f8b120dea08f7b1d74f/yt_dlp/cookies.py#L1300
https://stackoverflow.com/questions/22409780/flock-vs-lockf-on-linux
https://github.com/yt-dlp/yt-dlp/issues/393

cookies
https://github.com/yt-dlp/yt-dlp/issues/8227
https://github.com/yt-dlp/yt-dlp/issues/11094
https://github.com/yt-dlp/yt-dlp/issues/8227#issuecomment-1867184804
https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies
https://github.com/tubearchivist/tubearchivist/issues/817
https://github.com/yt-dlp/yt-dlp/issues/11868
https://github.com/yt-dlp/yt-dlp/issues/10128
https://github.com/yt-dlp/yt-dlp/issues/7874
https://www.reddit.com/r/youtubedl/comments/prsfvl/how_do_i_use_a_vpnproxy_only_for_ytdlp/
https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp
