import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
    const generatedHTML = templates.menuProduct(thisProduct.data);
    const menuContainer = document.querySelector(select.containerOf.menu);

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
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

    const clickableTrigger = thisProduct.clickableElement;

    clickableTrigger.addEventListener('click', function() {
      event.preventDefault();

      thisProduct.element.classList.toggle('active');

      const activeProducts = document.querySelectorAll('article.active');

      for (let activeproduct of activeProducts) {
        if (activeproduct !== thisProduct.element) {
          activeproduct.classList.remove('active');
        }
      }
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

    thisProduct.params = {};

    let price = thisProduct.data.price;

    let params = thisProduct.data.params;

    for (let paramID in params) {
      const param = params[paramID];

      for (let optionID in param.options) {
        let option = param.options[optionID];

        let selectedChoice =
          formData.hasOwnProperty(paramID) &&
          formData[paramID].indexOf(optionID) > -1;

        if (selectedChoice == true && !option.default) {
          price += option.price;
        } else if (selectedChoice == false && option.default) {
          price -= option.price;
        }

        const images = thisProduct.imageWrapper.querySelectorAll(
          `.${paramID}-${optionID}`
        );

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
    }

    thisProduct.priceSingle = price;
    thisProduct.price =
      thisProduct.priceSingle * thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = thisProduct.price;
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

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
