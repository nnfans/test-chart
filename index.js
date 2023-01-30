import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const API_KEY = 'cf9p89aad3i2irjrb600cf9p89aad3i2irjrb60g';

function translateResolution(res, countback, from, to) {

  return {
    from: from || (to - 60*60*24*countback*1000),
    to: to,
    resolution: 'D'
  }
}

const app = new express();
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}))

app.get('/v1/stock/detail/:code/candlestick', async (req, res) => {
  const query = req.query;
  const code = req.params.code;

  const {from, to, resolution} =  translateResolution(
    query.resolution, query.countback, query.from, query.to
    )

  const url = `https://finnhub.io/api/v1/stock/candle?`;

  const searchParam = new URLSearchParams(
      {
        symbol: code,
        resolution,
        from: Math.floor(from / 1000),
        to: Math.floor(to / 1000),
        token: API_KEY}
    )

  console.dir(url + searchParam.toString())
  const result = await fetch(url + searchParam.toString());
  const data = await result.json();
  
  const points = data.c?.map((close, ix) => {
    return {
      from_time: data.t[ix],
      to_time: data.t[ix] + 60 * 60,
      open: data.o[ix],
      close: close,
      low: data.l[ix],
      high: data.h[ix],
      volume: data.v[ix]
    }
  }) || 0

  res.json({
    err_code: "",
    err_message: "",
    points
  });
});

app.listen(9999, () => {
  console.log('Server started on http://localhost:9999');
});
  