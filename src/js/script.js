/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product'
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]'
      }
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]'
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]'
    }
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active'
    },
    cart: {
      wrapperActive: 'active'
    }
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9
    },
    cart: {
      defaultDelivereFee: 20
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    )
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderinMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
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

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }

    initAccordion() {
      const thisProduct = this;

      thisProduct.clickableElement = thisProduct.accordionTrigger;

      /* find the clickable trigger (the element that should react to clicking) */

      const clickableTrigger = thisProduct.clickableElement;

      /* START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function() {
        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');

        /* find all active products */
        const activeProducts = document.querySelectorAll('article.active');

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

    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);

      /*NEW*/
      thisProduct.params = {};

      /*Weź cenę początkową*/

      let price = thisProduct.data.price;

      /* Weź wszystkie paramsy w pętle for in */

      let params = thisProduct.data.params;

      for (let paramID in params) {
        const param = params[paramID];

        /*Nowa pętla, tym razem dla każdej opcji paramsów */

        for (let optionID in param.options) {
          let option = param.options[optionID];

          /*Sprawdź czy któryś box jest zaznaczony */

          let selectedChoice =
            formData.hasOwnProperty(paramID) &&
            formData[paramID].indexOf(optionID) > -1;

          /*Sprawdź czy jest defaultową opcją; Jeśli nie jest podnieś cenę, a jeśli był, zmniejsz cenę */

          if (selectedChoice == true && !option.default) {
            price += option.price;
          } else if (selectedChoice == false && option.default) {
            price -= option.price;
          }

          // Znajdźmy zdjęcia.

          const images = thisProduct.imageWrapper.querySelectorAll(
            `.${paramID}-${optionID}`
          );

          //Dodajmy pętle for of

          //jeśli opcja jest zaznaczona, dodajmy classlist, a jeśli nie jest - usuńmy.

          for (let image of images) {
            if (selectedChoice == true) {
              if (!thisProduct.params[paramID]) {
                thisProduct.params[paramID] = {
                  label: param.label,
                  options: {}
                };
              }
              thisProduct.params[paramID].options[optionID] = option.label;

              image.classList.add(classNames.menuProduct.imageVisible);
            } else image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
        console.log(thisProduct.params);
      }

      thisProduct.priceSingle = price;
      thisProduct.price =
        thisProduct.priceSingle * thisProduct.amountWidget.value;

      thisProduct.priceElem.innerHTML = thisProduct.price;

      // price *= thisProduct.amountWidget.value;
      // thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct);
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;

      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );

      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );

      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      if (
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      ) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function() {
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function() {
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);

      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
        select.cart.toggleTrigger
      );
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
        select.cart.productList
      );
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      console.log('generatedHTML', generatedHTML);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      console.log('generatedDOM', generatedDOM);
      thisCart.dom.productList.appendChild(generatedDOM);

      console.log('adding product', menuProduct);

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

    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function() {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    }
  };

  app.init();
}
