FROM ruby:2.5.3-stretch
WORKDIR /app
RUN gem install bundler
RUN bundle config --local path ~/vendor/bundle
ADD . /app/
RUN bundle install --jobs=8 --retry=3 --without development test --deployment
