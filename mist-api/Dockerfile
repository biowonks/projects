FROM biowonks/mist-lib.base

MAINTAINER BioWonks <biowonks@users.noreply.github.com>

COPY . /app/mist-api
RUN chown -R biowonks:biowonks /app
USER biowonks
WORKDIR /app/mist-api
RUN npm install

CMD ["npm", "start"]
