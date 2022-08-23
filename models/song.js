class Song {
  constructor(data) {
    (this.title = data.title || null),
      (this.author = data.author || null),
      (this.notes = data.notes || null),
      (this.instrumental = data.instrumental || null),
      (this.timesPlayed = data.timesPlayed || null),
      (this.firstTimePlayed = data.firstTimePlayed || null),
      (this.mostRecent = data.mostRecent || null);
  }
}

module.exports = Song;
