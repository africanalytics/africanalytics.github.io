function serialize(form) {
  if (!form || form.nodeName !== "FORM") {
    return;
  }
  var i,
    j,
    q = [];
  for (i = form.elements.length - 1; i >= 0; i = i - 1) {
    if (form.elements[i].name === "") {
      continue;
    }
    switch (form.elements[i].nodeName) {
      case "INPUT":
        switch (form.elements[i].type) {
          case "text":
          case "hidden":
          case "password":
          case "button":
          case "reset":
          case "email":
          case "submit":
            q.push(form.elements[i].name + "=" + form.elements[i].value);
            break;
          case "checkbox":
          case "radio":
            if (form.elements[i].checked) {
              q.push(form.elements[i].name + "=" + form.elements[i].value);
            }
            break;
          case "file":
            break;
        }
        break;
      case "TEXTAREA":
        q.push(form.elements[i].name + "=" + form.elements[i].value);
        break;
      case "SELECT":
        switch (form.elements[i].type) {
          case "select-one":
            q.push(form.elements[i].name + "=" + form.elements[i].value);
            break;
          case "select-multiple":
            for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
              if (form.elements[i].options[j].selected) {
                q.push(
                  form.elements[i].name +
                    "=" +
                    form.elements[i].options[j].value
                );
              }
            }
            break;
        }
        break;
      case "BUTTON":
        switch (form.elements[i].type) {
          case "reset":
          case "submit":
          case "button":
            q.push(form.elements[i].name + "=" + form.elements[i].value);
            break;
        }
        break;
    }
  }
  return q;
}

function getTraits(form) {
  var formData = serialize(form);
  var traits = {};
  var hsContextRegExp = new RegExp("hs_context");
  var utmRegExp = new RegExp("utm");

  for (var i = 0; i < formData.length; i++) {
    var inputData = formData[i].split("=");
    if (!hsContextRegExp.test(inputData[0])) {
      var traitName = inputData[0];
      if (!utmRegExp.test(traitName)) {
        var splitName = traitName.split("_");
        for (var k = 0; k < splitName.length; k++) {
          splitName[k] =
            splitName[k][0].toUpperCase() +
            splitName[k].substring(1, splitName[k].length);
        }
        traitName = splitName.join(" ");
      }
      switch (traitName.toLowerCase()) {
        case "firstname":
          traitName = "First Name";
          break;
        case "lastname":
          traitName = "Last Name";
          break;
        case "jobtitle":
          traitName = "Job Title";
          break;
        case "leadsource":
          traitName = "Lead Source";
          break;
        case "email":
          traitName = "Email";
      }
      traits[traitName] = inputData[1];
    }
  }

  return traits;
}
