/* PLEASE DO NOT CHANGE THIS FRAMEWORK ....
the get requests are all implemented and working ... 
so there is no need to alter ANY of the existing code: 
rather you just ADD your own ... */

window.onload = function () {
  document.querySelector("#queryChoice").selectedIndex = 0;
  //create once :)
  let description = document.querySelector("#Ex4_title");
  //array to hold the dataPoints
  let dataPoints = [];

  // /**** GeT THE DATA initially :: default view *******/
  // /*** no need to change this one  **/
  runQueryDefault("onload");

  /***** Get the data from drop down selection ****/
  let querySelectDropDown = document.querySelector("#queryChoice");

  querySelectDropDown.onchange = function () {
    console.log(this.value);
    let copyVal = this.value;
    console.log(copyVal);
    runQuery(copyVal);
  };

  /******************* RUN QUERY***************************  */
  async function runQuery(queryPath) {
    // // //build the url -end point
    const url = `/${queryPath}`;
    try {
      let res = await fetch(url);
      let resJSON = await res.json();
      console.log(resJSON);

      //reset the
      document.querySelector("#childOne").innerHTML = "";
      description.textContent = "";
      document.querySelector("#parent-wrapper").style.background =
        "rgba(51,102,255,.2)";

      switch (queryPath) {
        case "default": {
          displayAsDefault(resJSON);
          break;
        }
        case "one": {
          //sabine done
          displayInCirclularPattern(resJSON);
          break;
        }
        case "two": {
          //sabine done
          displayByGroups(resJSON, "weather", "eventName");
          break;
        }
        /***** TO DO FOR EXERCISE 4 *************************
         ** 1: Once you have implemented the mongodb query in server.py,
         ** you will receive it from the get request (THE FETCH HAS ALREADY BEEN IMPLEMENTED:: SEE ABOVE)
         ** and will automatically will enter into the correct select case
         **  - based on the value that the user chose from the drop down list...)
         ** You need to design and call a custom display function FOR EACH query that you construct ...
         ** 4 queries - I want 4 UNIQUE display functions - you can use the ones I created
         ** as inspiration ONLY - DO NOT just copy and change colors ... experiment, explore, change ...
         ** you can create your own custom objects - but NO images, video or sound... (will get 0).
         ** bonus: if your visualizations(s) are interactive or animate.
         ****/
        case "three": {
          console.log("three");
          visualizeThree(resJSON);
          break;
        }
        case "four": {
          console.log("four");
          visualizeFour(resJSON);
          break;
        }

        case "five": {
          console.log("five");
          visualizeFive(resJSON);
          break;
        }
        case "six": {
          console.log("six");
          visualizeSix(resJSON);
          break;
        }
        default: {
          console.log("default case");
          break;
        }
      } //switch
    } catch (err) {
      console.log(err);
    }
  }
  //will make a get request for the data ...

  /******************* RUN DEFAULT QUERY***************************  */
  async function runQueryDefault(queryPath) {
    // // //build the url -end point
    const url = `/${queryPath}`;
    try {
      let res = await fetch(url);
      let resJSON = await res.json();
      console.log(resJSON);
      displayAsDefault(resJSON);
    } catch (err) {
      console.log(err);
    }
  }
  /*******************DISPLAY AS GROUP****************************/

  function displayByGroups(resultObj, propOne, propTwo) {
    dataPoints = [];
    let finalHeight = 0;
    //order by WEATHER and Have the event names as the color  ....

    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(51, 153, 102,1)";
    description.textContent = "BY WEATHER AND ALSO HAVE EVENT NAMES {COLOR}";
    description.style.color = "rgb(179, 230, 204)";

    let coloredEvents = {};
    let resultSet = resultObj.results;

    //reget
    let possibleEvents = resultObj.events;
    let possibleColors = [
      "rgb(198, 236, 217)",
      "rgb(179, 230, 204)",
      "rgb(159, 223, 190)",
      "rgb(140, 217, 177)",
      "rgb(121, 210, 164)",
      "rgb(102, 204, 151)",
      "rgb(83, 198, 138)",
      "rgb(64, 191, 125)",
      "rgb(255, 204, 179)",
      "rgb(255, 170, 128)",
      "rgb(255, 153, 102)",
      "rgb(255, 136, 77)",
      "rgb(255, 119, 51)",
      "rgb(255, 102, 26)",
      "rgb(255, 85, 0)",
      "rgb(230, 77, 0)",
      "rgb(204, 68, 0)",
    ];

    for (let i = 0; i < possibleColors.length; i++) {
      coloredEvents[possibleEvents[i]] = possibleColors[i];
    }

    let offsetX = 20;
    let offsetY = 150;
    // find the weather of the first one ...
    let currentGroup = resultSet[0][propOne];
    console.log(currentGroup);
    let xPos = offsetX;
    let yPos = offsetY;

    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].event_name,
          //map to the EVENT ...
          coloredEvents[resultSet[i].event_name],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point_two"
        )
      );

      /** check if we have changed group ***/
      if (resultSet[i][propOne] !== currentGroup) {
        //update
        currentGroup = resultSet[i][propOne];
        offsetX += 150;
        offsetY = 150;
        xPos = offsetX;
        yPos = offsetY;
      }
      // if not just keep on....
      else {
        if (i % 10 === 0 && i !== 0) {
          xPos = offsetX;
          yPos = yPos + 15;
        } else {
          xPos = xPos + 15;
        }
      } //end outer else

      dataPoints[i].update(xPos, yPos);
      finalHeight = yPos;
    } //for

    document.querySelector("#childOne").style.height = `${finalHeight + 20}px`;
  } //function

  /*****************DISPLAY IN CIRCUlAR PATTERN:: <ONE>******************************/
  function displayInCirclularPattern(resultOBj) {
    //reset
    dataPoints = [];
    let xPos = 0;
    let yPos = 0;
    //for circle drawing
    let angle = 0;
    let centerX = window.innerWidth / 2;
    let centerY = 350;

    let scalar = 300;
    let yHeight = Math.cos(angle) * scalar + centerY;

    let resultSet = resultOBj.results;
    let coloredMoods = {};

    let possibleMoods = resultOBj.moods;
    let possibleColors = [
      "rgba(0, 64, 255,.5)",
      "rgba(26, 83, 255,.5)",
      "rgba(51, 102, 255,.7)",
      "rgba(51, 102, 255,.4)",
      "rgba(77, 121,255,.6)",
      "rgba(102, 140, 255,.6)",
      "rgba(128, 159, 255,.4)",
      "rgba(153, 179, 255,.3)",
      "rgba(179, 198, 255,.6)",
      "rgba(204, 217, 255,.4)",
    ];

    for (let i = 0; i < possibleMoods.length; i++) {
      coloredMoods[possibleMoods[i]] = possibleColors[i];
    }

    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(0, 26, 102,1)";
    description.textContent = "BY AFTER MOOD";
    description.style.color = "rgba(0, 64, 255,.5)";

    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].event_name,
          //map to the day ...
          coloredMoods[resultSet[i].after_mood],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point_two"
        )
      );
      /*** circle drawing ***/
      xPos = Math.sin(angle) * scalar + centerX;
      yPos = Math.cos(angle) * scalar + centerY;
      angle += 0.13;

      if (angle > 2 * Math.PI) {
        angle = 0;
        scalar -= 20;
      }
      dataPoints[i].update(xPos, yPos);
    } //for

    document.querySelector("#childOne").style.height = `${yHeight}px`;
  } //function

  /*****************DISPLAY AS DEFAULT GRID :: AT ONLOAD ******************************/
  function displayAsDefault(resultOBj) {
    //reset
    dataPoints = [];
    let xPos = 0;
    let yPos = 0;
    const NUM_COLS = 50;
    const CELL_SIZE = 20;
    let coloredDays = {};
    let resultSet = resultOBj.results;
    possibleDays = resultOBj.days;
    /*
  1: get the array of days (the second entry in the resultOBj)
  2: for each possible day (7)  - create a key value pair -> day: color and put in the
  coloredDays object
  */
    console.log(possibleDays);
    let possibleColors = [
      "rgb(255, 102, 153)",
      "rgb(255, 77, 136)",
      "rgb(255, 51, 119)",
      "rgb(255, 26, 102)",
      "rgb(255, 0, 85)",
      "rgb(255, 0, 85)",
      "rgb(255, 0, 85)",
    ];

    for (let i = 0; i < possibleDays.length; i++) {
      coloredDays[possibleDays[i]] = possibleColors[i];
    }
    /* for through each result
1: create a new MyDataPoint object and pass the properties from the db result entry to the object constructor
2: set the color using the coloredDays object associated with the resultSet[i].day
3:  put into the dataPoints array.
**/
    //set background of parent ... for fun ..
    document.querySelector("#parent-wrapper").style.background =
      "rgba(255,0,0,.4)";
    description.textContent = "DEfAULT CASE";
    description.style.color = "rgb(255, 0, 85)";

    //last  element is the helper array...
    for (let i = 0; i < resultSet.length - 1; i++) {
      dataPoints.push(
        new myDataPoint(
          resultSet[i].dataId,
          resultSet[i].day,
          resultSet[i].weather,
          resultSet[i].start_mood,
          resultSet[i].after_mood,
          resultSet[i].after_mood_strength,
          resultSet[i].event_affect_strength,
          resultSet[i].evnet_name,
          //map to the day ...
          coloredDays[resultSet[i].day],
          //last parameter is where should this go...
          document.querySelector("#childOne"),
          //which css style///
          "point"
        )
      );

      /** this code is rather brittle - but does the job for now .. draw a grid of data points ..
//*** drawing a grid ****/
      if (i % NUM_COLS === 0) {
        //reset x and inc y (go to next row)
        xPos = 0;
        yPos += CELL_SIZE;
      } else {
        //just move along in the column
        xPos += CELL_SIZE;
      }
      //update the position of the data point...
      dataPoints[i].update(xPos, yPos);
    } //for
    document.querySelector("#childOne").style.height = `${yPos + CELL_SIZE}px`;
  } //function

  let threeAnimationRunning = false;
  function visualizeThree(resultObj) {
    threeAnimationRunning = false;
    threeAnimationRunning = true;
    dataPoints = [];

    const wrapper = document.querySelector("#parent-wrapper");
    wrapper.style.background = "rgba(240, 255, 245, 0.7)";
    description.textContent =
      "POSITIVE MOODS — SCATTERED CONFETTI (COLOR = EVENT NAME)";
    description.style.color = "rgb(40, 60, 120)";

    const container = document.querySelector("#childOne");
    container.innerHTML = "";

    const width = window.innerWidth;
    const height = window.innerHeight * 0.5;
    container.style.height = height + "px";

    const resultSet = resultObj.results;

    const eventColors = [
      "#FF6B6B",
      "#FFD93D",
      "#6BCB77",
      "#4D96FF",
      "#9D4EDD",
      "#FF8E3C",
      "#FF5D8F",
      "#71C9CE",
      "#62D2A2",
      "#F2CD5C",
      "#9ADCFF",
      "#FFB5E8",
      "#C77DFF",
      "#80ED99",
      "#FF9770",
    ];

    const events = [...new Set(resultSet.map((e) => e.event_name))];
    const eventColorMap = {};
    events.forEach((name, i) => {
      eventColorMap[name] = eventColors[i % eventColors.length];
    });

    resultSet.forEach((item, i) => {
      const x = (i / resultSet.length) * (width - 200) + 100;
      const y = Math.random() * (height - 40) + 20;
      const size = 6 + item.after_mood_strength * 2.3;

      const dp = new myDataPoint(
        item.dataId,
        item.day,
        item.weather,
        item.start_mood,
        item.after_mood,
        item.after_mood_strength,
        item.event_affect_strength,
        item.event_name,
        eventColorMap[item.event_name],
        container,
        "point_three"
      );

      dp.container.style.width = size + "px";
      dp.container.style.height = size + "px";
      dp.container.style.opacity = 0.85;
      dp.update(x, y);
      dp.driftX = (Math.random() - 0.5) * 0.4;
      dp.driftY = (Math.random() - 0.5) * 0.4;
      dataPoints.push(dp);
    });

    function animateBubbles() {
      if (!threeAnimationRunning) return;
      const leftLimit = 60;
      const rightLimit = width - 60;

      dataPoints.forEach((dp) => {
        dp.x += dp.driftX;
        dp.y += dp.driftY;

        if (dp.y < 20 || dp.y > height - 20) {
          dp.driftY *= -1;
        }

        if (dp.x < leftLimit) dp.x = rightLimit;
        if (dp.x > rightLimit) dp.x = leftLimit;

        dp.update(dp.x, dp.y);
      });
      requestAnimationFrame(animateBubbles);
    }
    animateBubbles();
  }

  function visualizeFour(resultObj) {
    threeAnimationRunning = false;
    dataPoints = [];
    const wrapper = document.querySelector("#parent-wrapper");
    wrapper.style.background = "black";
    description.textContent =
      "BY EVENT NAME — GROUPED ROWS (COLOR = EVENT NAME)";
    description.style.color = "white";
    const resultSet = resultObj.results;
    const container = document.querySelector("#childOne");
    container.innerHTML = "";
    const height = window.innerHeight * 0.35;
    container.style.height = height + "px";
    let groups = {};
    resultSet.forEach((e) => {
      if (!groups[e.event_name]) groups[e.event_name] = [];
      groups[e.event_name].push(e);
    });

    const eventNames = Object.keys(groups);

    const eventColors = [
      "#FF6B6B",
      "#FFD93D",
      "#6BCB77",
      "#4D96FF",
      "#9D4EDD",
      "#FF8E3C",
      "#FF5D8F",
      "#71C9CE",
      "#62D2A2",
      "#F2CD5C",
      "#9ADCFF",
      "#FFB5E8",
      "#C77DFF",
      "#80ED99",
      "#FF9770",
    ];

    let eventColorMap = {};
    eventNames.forEach((name, i) => {
      eventColorMap[name] = eventColors[i % eventColors.length];
    });

    const rowHeight = height / (eventNames.length + 2);
    const leftX = 40;
    const spacing = 10;
    const dotSize = 7;
    let delayCounter = 0;

    eventNames.forEach((name, rowIndex) => {
      const entries = groups[name];
      const y = (rowIndex + 1) * rowHeight;

      entries.forEach((item, i) => {
        const x = leftX + i * spacing;
        const dp = new myDataPoint(
          item.dataId,
          item.day,
          item.weather,
          item.start_mood,
          item.after_mood,
          item.after_mood_strength,
          item.event_affect_strength,
          item.event_name,
          eventColorMap[name],
          container,
          "point_four"
        );

        dp.container.style.width = dotSize + "px";
        dp.container.style.height = dotSize + "px";
        dp.container.style.opacity = 0;
        dp.container.style.transform = "";
        dp.update(x, y);
        dp.container.style.transition = `opacity 0.6s ease ${
          delayCounter * 0.008
        }s`;

        setTimeout(() => {
          dp.container.style.opacity = 0.9;
        }, 10);

        dataPoints.push(dp);
        delayCounter++;
      });
    });
  }

  function visualizeFive(resultObj) {
    threeAnimationRunning = false;

    dataPoints = [];

    const wrapper = document.querySelector("#parent-wrapper");
    wrapper.style.background = "rgba(245, 250, 250)";
    description.textContent =
      "BY DAY (MONDAY vs TUESDAY) — SIZE = EVENT AFFECT STRENGTH";
    description.style.color = "rgb(20, 40, 90)";

    const container = document.querySelector("#childOne");
    container.innerHTML = "";

    const width = window.innerWidth;
    const height = window.innerHeight * 0.75;
    container.style.height = height + "px";

    const centerY = height / 2;
    const centerLeft = width * 0.3;
    const centerRight = width * 0.7;

    const resultSet = resultObj.results;

    const monday = resultSet.filter((e) => e.day === "Monday");
    const tuesday = resultSet.filter((e) => e.day === "Tuesday");

    const mondayColor = "#e67a7a";
    const tuesdayColor = "#72a3ff";

    function drawSpiral(entries, centerX, color) {
      if (entries.length === 0) return;

      const maxRadius = Math.min(width * 0.2, height * 0.35);
      const radiusStep = maxRadius / entries.length;
      const angleStep = 0.35;

      let angle = 0;
      let radius = 0;

      entries.forEach((item) => {
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        angle += angleStep;
        radius += radiusStep;

        const size = 4 + item.event_affect_strength * 1.2;

        const dp = new myDataPoint(
          item.dataId,
          item.day,
          item.weather,
          item.start_mood,
          item.after_mood,
          item.after_mood_strength,
          item.event_affect_strength,
          item.event_name,
          color,
          container,
          "point_five"
        );

        dp.container.style.width = size + "px";
        dp.container.style.height = size + "px";
        dp.container.style.transformOrigin = "center center";
        dp.container.style.transform = "";
        dp.update(x, y);
        dataPoints.push(dp);
      });
    }

    drawSpiral(monday, centerLeft, mondayColor);
    drawSpiral(tuesday, centerRight, tuesdayColor);

    function pulse() {
      const time = Date.now() * 0.003;

      dataPoints.forEach((dp) => {
        if (!container.contains(dp.container)) return;
        if (!dp.container.classList.contains("point_five")) return;

        const scale = 1 + Math.sin(time + dp.x * 0.01 + dp.y * 0.01) * 0.25;
        dp.container.style.transform = `scale(${scale})`;
      });
      if (container.querySelector(".point_five")) {
        requestAnimationFrame(pulse);
      }
    }
    pulse();
  }

  function visualizeSix(resultObj) {
    dataPoints = [];
    const wrapper = document.querySelector("#parent-wrapper");
    wrapper.style.background = "#814b00ff";
    description.textContent =
      "BY NEGATIVE MOODS — LAYERS OF SOIL (has on hover effect)";
    description.style.color = "black";
    const resultSet = resultObj.results;
    const container = document.querySelector("#childOne");
    container.innerHTML = "";
    const topOffset = 80;

    const weatherOrder = [
      "snowing",
      "sunny",
      "clear",
      "cloudy",
      "raining",
      "grey",
      "stormy",
    ];

    description.style.color = "rgba(255, 255, 255, 1)";
    const weatherColors = {
      snowing: "#2ca41dff",
      sunny: "#382501ff",
      clear: "#e09b24ff",
      cloudy: "#eddcba",
      raining: "#a73107ff",
      grey: "#6f6a66",
      stormy: "#3f3b37",
    };

    const bandHeight = 70;
    const layerY = {};

    weatherOrder.forEach((weather, index) => {
      layerY[weather] = topOffset + index * bandHeight;
    });

    const width = window.innerWidth;

    resultSet.forEach((item) => {
      const w = item.weather;
      const baseY = layerY[w] || 400;
      const x = 100 + Math.random() * (width - 300);
      const y = baseY + (Math.random() * 40 - 20);
      const dp = new myDataPoint(
        item.dataId,
        item.day,
        item.weather,
        item.start_mood,
        item.after_mood,
        item.after_mood_strength,
        item.event_affect_strength,
        item.event_name,
        weatherColors[w],
        container,
        "point_two"
      );

      dp.update(x, y);
      dataPoints.push(dp);
      dp.container.onmouseenter = () => {
        dp.container.style.transform = "scale(1.35)";
        dp.container.style.transition = "transform 0.2s ease";
      };
      dp.container.onmouseleave = () => {
        dp.container.style.transform = "scale(1)";
      };
    });

    container.style.height =
      topOffset + weatherOrder.length * bandHeight + "px";
  }
};
