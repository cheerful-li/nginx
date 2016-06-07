FROM hub.c.163.com/nce2/nodejs:0.12.2
MAINTAINER lilieming
#mongodb && ssh  && git
RUN apt-get update && apt-get -y install mongodb && apt-get -y install openssh-server && apt-get -y install git

RUN mkdir app
WORKDIR /app
RUN git clone https://github.com/cheerful-li/whereMyMoney.git money
WORKDIR /app/money

CMD service mongodb start && service ssh start && node bin/www

EXPOSE 3000 22 8080



