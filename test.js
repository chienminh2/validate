//Hàm thực hiện validate
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};
  //Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorMessage;
    var rules = selectorRules[rule.selector];

    //Lập qua & check từng phần tử
    for (var i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case 'radio':
        case 'checkbox':
      errorMessage = rules[i](
          formElement.querySelector(rule.selector + ':checked')
        );
        break;
      default:
        errorMessage = rules[i](inputElement.value)
      }

      if (errorMessage) break;
    }

    var errorElement = getParent(inputElement,options.selectorFormGroup).querySelector(options.selectorElement);
    //Hàm thực hiện validator
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.selectorFormGroup).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.selectorFormGroup).classList.remove("invalid");
    }
    return !errorMessage;
  }

  //Chọn form cần select
  var formElement = document.querySelector(options.form);
  if (formElement) {
    //Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFormValid = true;

      //Lặp qua từng rules và validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]:not(disable)");
          var ValueInput = Array.from(enableInputs).reduce(function (values,input) {
            switch (input.type) {
              case 'radio':
                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
               break;
              case 'checkbox':
                if (!input.matches(':checked')) {
                  values[input.name] = '';
                  return values
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = []
                }
                values[input.name].push(input.value)
              break;

              default:
                values[input.name] = input.value
            }
            return values;
          },{}
        );
          options.onSubmit(ValueInput);
        }
        // else {
        //   formElement.submit()
        // }
      }
    };
  }

  //Lập qua mỗi rule và xử lí (lắng nghe sự kiện, on blur)
  options.rules.forEach(function (rule) {
    const inputElements = document.querySelectorAll(rule.selector);
    Array.from(inputElements).forEach(function (inputElement) {
    //Lưu lại các rule sao mỗi input
    if (Array.isArray(selectorRules[rule.selector])) {
      selectorRules[rule.selector].push(rule.test);
    } else {
      selectorRules[rule.selector] = [rule.test];
    }

    if (inputElement) {
      inputElement.onblur = function () {
        validate(inputElement, rule);
      };
    }
    //Hàm xử lí khi người dùng nhập vào
    const errorElement = getParent(inputElement,options.selectorFormGroup).querySelector(options.selectorElement);
    inputElement.oninput = function () {
      errorElement.innerText = "";
      getParent(inputElement, options.selectorFormGroup).classList.remove("invalid");
      }
    });
  });
}

Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regex.test(value) ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
    },
  };
};

Validator.isConfirm = function (selector, getConfirm, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirm() ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};
