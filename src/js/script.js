/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product'
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart'
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select'
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]'
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]'
      }
    }
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active'
    }
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    )
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderinMenu();
      thisProduct.initAccordion();
    }

    renderinMenu() {
      const thisProduct = this;

      /* Generate HTML code of a single product */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* Create DOM element from that code using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* Find menu container */

      const menuContainer = document.querySelector(select.containerOf.menu);

      /* push created DOM element into the menu container */

      menuContainer.appendChild(thisProduct.element);
    }


    initAccordion() {
      // productHeader = '.product__header';

      const thisProduct = this;

      thisProduct.clickableElement = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );

      /* find the clickable trigger (the element that should react to clicking) */

      const clickableTrigger = thisProduct.clickableElement;

      console.log(clickableTrigger);

      // buttonTest.addEventListener('click', function(){
      //   console.log('clicked');

      /* START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function() {
        console.log(clickableTrigger);

        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');

        /* find all active products */
        const activeProducts = document.querySelectorAll('article.active');

        // 'a.active[href^="#author-"]'

        /* START LOOP: for each active product */
        for (let activeproduct of activeProducts) {

          /* START: if the active product isn't the element of thisProduct */
          if (activeproduct !== thisProduct.element) {

            /* remove class active for the active product */
            activeproduct.classList.remove('active');

            /* END: if the active product isn't the element of thisProduct */
          }

          /* END LOOP: for each active product */
        }

        /* END: click event listener to trigger */
      });
    }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function() {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function() {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    }
  };

  app.init();
}
