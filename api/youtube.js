export default async function handler(req, res) {
  const playlistId = "PL0-3OpEXDMjJbge2zORqKaKcgsqQq2wZM";

  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?part=snippet` +
    `&maxResults=25` +
    `&playlistId=${playlistId}` +
    `&key=${process.env.YOUTUBE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  res.setHeader("Cache-Control", "s-maxage=21600");
  res.status(200).json(data);
}