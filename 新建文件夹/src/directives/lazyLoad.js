// 图片懒加载指令
export const lazyLoadDirective = {
  mounted(el, binding) {
    // 占位图
    const placeholder = el.getAttribute('placeholder-src')
    if (placeholder) {
      el.src = placeholder
    }

    // 图片加载函数
    const loadImage = () => {
      const img = new Image()
      img.src = binding.value
      img.onload = () => {
        el.src = binding.value
        el.style.opacity = '1'
      }
    }

    // 检查是否在可视区域
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadImage()
        observer.unobserve(el)
      }
    })

    observer.observe(el)
  }
}