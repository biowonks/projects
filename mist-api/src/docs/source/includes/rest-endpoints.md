# REST Endpoints


## Genomes


### List Genomes
```bash
curl --request GET \
  --url http://localhost:5000/v1/genomes
```

```javascript
var http = require("http");

var options = {
  "method": "GET",
  "hostname": "localhost",
  "port": "5000",
  "path": "/v1/genomes",
  "headers": {}
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();
```

```python
import http.client

conn = http.client.HTTPConnection("localhost:5000")

conn.request("GET", "/v1/genomes")

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))
```

```ruby
require 'uri'
require 'net/http'

url = URI("http://localhost:5000/v1/genomes")

http = Net::HTTP.new(url.host, url.port)

request = Net::HTTP::Get.new(url)

response = http.request(request)
puts response.read_body
```



Returns an array of genomes.

`GET /genomes`

