new Vue({
  el: "#app",
  data() {
    return {
      audio: null,
      circleLeft: null,
      barWidth: null,
      duration: null,
      currentTime: null,
      isTimerPlaying: false,
      tracks: [
        {
          name: "Forever Young",
          artist: "朴树",
          cover: "https://p3-webcast.douyinpic.com/img/webcast/ksong_newcover_pop6.jpg~tplv-obj.image",
          source: "https://github.com/bfjy2023/bfjyplayer/mp3/下载.m4a",
          url: "https://v3-chd.douyinvod.com/79287c1727a9a1beabbb26083f633cd2/670d3d4c/video/tos/cn/tos-cn-ve-2774/o8AIRUApY0AthUxsAJLrYDJzWJghS8QImE8J2/",
          favorited: false,
        },
        {
          name: "Rag'n'Bone Man",
          artist: "Human",
          cover: "https://raw.githubusercontent.com/muhammederdem/mini-player/master/img/9.jpg",
          source: "https://raw.githubusercontent.com/muhammederdem/mini-player/master/mp3/9.mp3",
          url: "https://www.youtube.com/watch?v=L3wKzyIN1yk",
          favorited: false,
        },
      ],
      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null,
    };
  },
  methods: {
    play() {
      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },
    generateTime() {
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.barWidth = width + "%";
      this.circleLeft = width + "%";
      let durmin = Math.floor(this.audio.duration / 60) || 0;
      let dursec = Math.floor(this.audio.duration - durmin * 60) || 0;
      let curmin = Math.floor(this.audio.currentTime / 60) || 0;
      let cursec = Math.floor(this.audio.currentTime - curmin * 60) || 0;
      if (durmin < 10) {
        durmin = "0" + durmin;
      }
      if (dursec < 10) {
        dursec = "0" + dursec;
      }
      if (curmin < 10) {
        curmin = "0" + curmin;
      }
      if (cursec < 10) {
        cursec = "0" + cursec;
      }
      this.duration = durmin + ":" + dursec;
      this.currentTime = curmin + ":" + cursec;
    },
    updateBar(x) {
      let progress = this.$refs.progress;
      let maxduration = this.audio.duration;
      let position = x - progress.offsetLeft;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      this.barWidth = percentage + "%";
      this.circleLeft = percentage + "%";
      this.audio.currentTime = (maxduration * percentage) / 100;
      this.audio.play();
    },
    clickProgress(e) {
      this.isTimerPlaying = true;
      this.audio.pause();
      this.updateBar(e.pageX);
    },
   
    resetPlayer() {
      this.barWidth = 0;
      this.circleLeft = 0;
      this.audio.currentTime = 0;
      this.audio.src = this.currentTrack.source;
      setTimeout(() => {
        if (this.isTimerPlaying) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
      }, 300);
    },
    favorite() {
      this.tracks[this.currentTrackIndex].favorited =
        !this.tracks[this.currentTrackIndex].favorited;
    },
  },
  onBeforeUnmount() {
    localStorage.setItem("tracks", JSON.stringify(this.tracks));
  },
  created() {
    // 进入项目首先检测地址栏的参数，是否包含歌曲信息，如果存在，则插入到当前播放列表中，并播放
    // 检测 URL 参数
    const params = new URLSearchParams(window.location.hash.substring(1));
    const songName = params.get("name");
    const artist = params.get("artist");
    const cover = params.get("cover");
    const source = params.get("source");
    // 取出本地缓存中的数据，赋值给播放列表
    const localTracks = localStorage.getItem("tracks");
    if (localTracks) {
      this.tracks = JSON.parse(localTracks);
    } else {
      // 默认播放列表
      this.tracks = [
        {
          name: "Forever Young",
          artist: "朴树",
          cover: "https://p3-webcast.douyinpic.com/img/webcast/ksong_newcover_pop6.jpg~tplv-obj.image",
          source: "https://github.com/bfjy2023/bfjyplayer/mp3/下载.m4a",
          url: "https://v3-chd.douyinvod.com/79287c1727a9a1beabbb26083f633cd2/670d3d4c/video/tos/cn/tos-cn-ve-2774/o8AIRUApY0AthUxsAJLrYDJzWJghS8QImE8J2/",
          favorited: false,
        },
      ];
    }
    if (songName && artist && cover && source) {
      this.tracks = this.tracks.filter((track) => track.source !== source);
      // 放第一个
      this.tracks.unshift({
        name: songName,
        artist: artist,
        cover: cover,
        source: source,
        favorited: false,
      });
      // 过滤重复的歌曲 根据资源路径判别
      // 将播放列表数据存储到本地缓存
      localStorage.setItem("tracks", JSON.stringify(this.tracks));
    }

    let vm = this;
    this.currentTrack = this.tracks[0];
    this.audio = new Audio();
    this.audio.src = this.currentTrack.source;
    this.audio.ontimeupdate = function () {
      vm.generateTime();
    };
    this.audio.onloadedmetadata = function () {
      vm.generateTime();
    };
    this.audio.onended = function () {
      vm.nextTrack();
      this.isTimerPlaying = true;
    };

    // this is optional (for preload covers)
    for (let index = 0; index < this.tracks.length; index++) {
      const element = this.tracks[index];
      let link = document.createElement("link");
      link.rel = "prefetch";
      link.href = element.cover;
      link.as = "image";
      document.head.appendChild(link);
    }
  },
});
