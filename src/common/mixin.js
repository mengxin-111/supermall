import { debounce } from "./utils";
import BackTop from "components/content/backTop/BackTop";

export const itemListenMixin = {
  data() {
    return {
      itemImgListener: null,
    }
  },
  mounted() {
    // 1. 图片加载完成的事件监听
    const refresh = debounce(this.$refs.scroll.refresh, 200);
    // 对监听的事件进行保存
    this.itemImgListen = () => {
      refresh();
    };
    this.$bus.$on("itemImageLoad", this.itemImgListen);
  },
}

export const backTopMixin = {
  data() {
    return {
      isShowBackTop: false,
    }
  },
  components: {
    BackTop,
  },
  methods: {
    backTop() {
      this.$refs.scroll.scollTo(0, 0, 300);
    },
    demo(position) {
      this.isShowBackTop = -position.y > 1000;
    }
  },
}

export const tabControlMixin = {
  data: function () {
    return {
      currentType: POP
    }
  },
  methods: {
    tabClick(index) {
      switch (index) {
        case 0:
          this.currentType = POP
          break
        case 1:
          this.currentType = NEW
          break
        case 2:
          this.currentType = SELL
          break
      }
      console.log(this.currentType);
    }
  }
}