import {
  ADD_COUNTER,
  ADD_TO_CART
} from './mutation-types'

export default {
  addCart(context, payLoad) {
    return new Promise((resolve, reject) => {
      // 1. 查找之前数组中是否有该商品
      let oldProduct = context.state.cartList.find(item => {
        return item.iid === payLoad.iid;
      })
      // 2. 判断oldProduct
      if (oldProduct) {
        // oldProduct.count += 1;
        context.commit(ADD_COUNTER, oldProduct);
        resolve('当前的商品数量+1');
      } else {
        context.commit(ADD_TO_CART, payLoad);
        resolve('添加了新的商品');
      }
    })
  }
}