FROM centos:7 as os

RUN curl -s https://nodejs.org/dist/v8.11.3/node-v8.11.3-linux-x64.tar.xz | tar -Jx -C /usr/local --strip-components 1

RUN mkdir -p /tmp/etc
RUN useradd -r -M -s /sbin/nologin recursivecall -U
RUN grep recursivecall /etc/passwd > /tmp/etc/passwd && \
    grep recursivecall /etc/group > /tmp/etc/group

FROM scratch as tiny-node

COPY --from=os /usr/bin/sh /usr/local/bin/node /bin/
COPY --from=os /usr/bin/env /usr/bin/mkdir /usr/bin/
COPY --from=os /tmp/etc/passwd /tmp/etc/group /etc/

FROM os as build

WORKDIR /var/app

COPY package.json .

RUN npm install

COPY . .

FROM tiny-node

LABEL maintainer "dfb@davidbetz.net"

WORKDIR /var/app

COPY --from=build /var/app .

ENV PORT=3000

EXPOSE $PORT

USER recursivecall:recursivecall

ENTRYPOINT ["node", "app.js"]
