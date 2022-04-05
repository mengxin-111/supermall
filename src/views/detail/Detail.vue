<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav" />
    <scroll class="content" ref="scroll" @scroll="contentScroll" :probeType="3">
      <detail-swiper :top-images="topImages" />
      <detail-base-info :goods="goods" />
      <detail-shop-info :shop="shop" />
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad" />
      <detail-param-info :param-info="paramInfo" ref="params" />
      <detail-comment-info :comment-info="commentInfo" ref="comment" />
      <goods-list :goods="recommends" ref="recommend" />
    </scroll>
    <detail-bottom-bar @addCart="addToCart" />
    <back-top v-show="isShowBackTop" @click.native="backClick" />
    <!-- <toast :message="message" :show="show" /> -->
  </div>
</template>

<script>
import DetailNavBar from "./childComps/DetailNavBar";
import DetailSwiper from "./childComps/DetailSwiper";
import DetailBaseInfo from "./childComps/DetailBaseInfo";
import DetailShopInfo from "./childComps/DetailShopInfo";
import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
import DetailParamInfo from "./childComps/DetailParamInfo";
import DetailCommentInfo from "./childComps/DetailCommentInfo";
import DetailBottomBar from "./childComps/DetailBottomBar.vue";

import Scroll from "components/common/scroll/Scroll";
import GoodsList from "components/content/goods/GoodsList";
import GoodsListItem from "components/content/goods/GoodsListItem";
import BackTop from "components/content/backTop/BackTop";
// import Toast from "components/common/toast/Toast";

import { debounce } from "common/utils";

import { mapActions } from "vuex";

import {
  getDetail,
  Goods,
  Shop,
  GoodsParam,
  getRecommend,
} from "network/detail";
import { itemListenMixin } from "common/mixin";

export default {
  name: "Detail",
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    Scroll,
    GoodsList,
    DetailBottomBar,
    BackTop,
    // Toast,
  },
  data() {
    return {
      iid: null,
      topImages: [],
      goods: {},
      shop: {},
      detailInfo: {},
      paramInfo: {},
      commentInfo: {},
      recommends: [],
      themeTopYs: [],
      getThemeTopY: null,
      currentIndex: 0,
      isShowBackTop: false,
      // message: "",
      // show: false,
    };
  },
  created() {
    // 1. 保存传入的iid
    this.iid = this.$route.params.iid;

    // 2. 根据iid请求详情数据
    getDetail(this.iid).then((res) => {
      const data = res.result;

      // 1. 获取顶部的图片轮播数据
      this.topImages = data.itemInfo.topImages;
      // 2. 获取商品信息
      this.goods = new Goods(
        data.itemInfo,
        data.columns,
        data.shopInfo.services
      );
      // 3. 创建店铺信息对象
      this.shop = new Shop(data.shopInfo);

      // 4. 保存商品的详情数据
      this.detailInfo = data.detailInfo;

      // 5. 获取参数信息
      this.paramInfo = new GoodsParam(
        data.itemParams.info,
        data.itemParams.rule
      );

      // 6. 取出评论的信息
      if (data.rate.cRate !== 0) {
        this.commentInfo = data.rate.list[0];
      }

      // this.$nextTick(() => {
      //   // 根据最新的数据，对应的DOM是已经被渲染出来
      //   // 但是图片依然是没有加载完(目前获取到offsetTop不包含其中的图片)
      //   // offsetTop值不对的时候，都是因为图片的问题
      //   this.themeTopYs = [];

      //   this.themeTopYs.push(0);
      //   this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      //   this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      //   this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
      // });
    });

    getRecommend().then((res) => {
      this.recommends = res.data.list;
    });

    // 4. 给getThemeTopY赋值
    this.getThemeTopY = debounce(() => {
      this.themeTopYs = [];

      this.themeTopYs.push(0);
      this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
      this.themeTopYs.push(Number.MAX_VALUE);
    }, 100);
  },
  mounted() {},
  updated() {},
  destroyed() {
    this.$bus.$off("itemImgLoad", this.itemImgListener);
  },
  methods: {
    ...mapActions(["addCart"]),

    imageLoad() {
      this.$refs.scroll.refresh();
      this.getThemeTopY();
    },
    titleClick(index) {
      this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 200);
    },
    backClick() {
      this.$refs.scroll.scrollTo(0, 0, 500);
    },
    contentScroll(position) {
      // 1. 获取y值
      const positionY = -position.y;
      let length = this.themeTopYs.length;
      // 2. positionY和主体中值进行对比
      for (let i = 0; i < length - 1; i++) {
        // if (
        //   (this.currentIndex !== i &&
        //     i < length - 1 &&
        //     positionY >= this.themeTopYs[i] &&
        //     positionY < this.themeTopYs[i + 1]) ||
        //   (i === length - 1 && positionY >= this.themeTopYs[i])
        // ) {
        //   this.currentIndex = i;
        //   this.$refs.nav.currentIndex = this.currentIndex;
        // }
        if (
          this.currentIndex !== i &&
          positionY >= this.themeTopYs[i] &&
          positionY < this.themeTopYs[i + 1]
        ) {
          this.currentIndex = i;
          this.$refs.nav.currentIndex = this.currentIndex;
        }
      }
      // 是否显示回到顶部
      this.isShowBackTop = -position.y > 1000;
    },
    addToCart() {
      // 1. 获取购物车需要展示的信息
      const product = {};
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.realPrice;
      product.iid = this.iid;
      // 2. 将商品添加到购物车里面
      // this.$store.dispatch("addCart", product).then((res) => {});
      this.addCart(product).then((res) => {
        // this.show = true;
        // this.message = res;
        // setTimeout(() => {
        //   this.show = false;
        //   this.message = "";
        // }, 1500);
        this.$toast.show(res, 2000);
      });
    },
  },
};
</script>

<style scoped>
#detail {
  position: relative;
  z-index: 9;
  background-color: #fff;
  height: 100vh;
}

.detail-nav {
  position: relative;
  z-index: 9;
  background-color: #fff;
}

.content {
  height: calc(100% - 44px - 49px);
  position: absolute;
  top: 44px;
  bottom: 58px;
  left: 0;
  right: 0;
  background-color: #fff;
}
</style>