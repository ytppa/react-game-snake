import React from "react";
import "../styles.css";
import "../experiment.css";

import PlayField from "./PlayField.js";
import StatusMessage from "./StatusMessage.js";
import StatsPanel from "./StatsPanel.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 20,
      height: 20,
      eatedRabbits: 0,
      level: 0,
      rabbits: [],
      snake: [],
      direction: "RIGHT",

      /**
       * Possible game statuses:
       * PREPARING
       * READY
       * PLAYING
       * PAUSE
       * GAME_OVER
       */
      status: "PREPARING",
      defaults: {
        snakeLength: 10,
        rabbitsAmount: 2,
        canTurnBack: false,
        canTurnOnWall: false,
        rabbitBirthInterval: 5,
        startDelay: 300,
        levelStep: 10,
        eatedRabbits: 0,
        level: 0,
        direction: "RIGHT"
      }
    };
    this.interval = null;

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.tryToMove = this.tryToMove.bind(this);
    this.restart = this.restart.bind(this);
  }

  /**
   * Prevent updating DOM if:
   * - Stage is still preparing
   * - Game is paused
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.status === "PREPARING") return false;

    return true;
  }

  /**
   * Handling the key press to rule the snake
   * @param {Object} event - contains key code in an attribute `keyCode`
   */
  handleKeyPress(event) {
    const keycode = event.keyCode ? event.keyCode : event.which,
      { status } = this.state;

    // Restart
    if (keycode === 82) {
      // Restart
      clearInterval(this.interval);
      this.restart();
      return false;
    }

    // Just memo:
    // w = 87, a = 65, s = 83, d = 68
    // up = 38, left = 37, down = 40, right = 39
    if (status === "PLAYING") {
      if (keycode === 87 || keycode === 38) {
        // Try to turn Up
        this.tryToTurnUp();
      } else if (keycode === 65 || keycode === 37) {
        // Try to turn Left
        this.tryToTurnLeft();
      } else if (keycode === 83 || keycode === 40) {
        // Try to turn Down
        this.tryToTurnDown();
      } else if (keycode === 68 || keycode === 39) {
        // Try to turn Right
        this.tryToTurnRight();
      }
    }

    // Pause
    if (keycode === 80 || keycode === 32) {
      // Pause toggling
      this.togglePause();
    }

    // Temporarily keybinding to trigger movement
    // if (keycode === 32) this.tryToMove();
    if (status === "READY") {
      this.setState({ status: "PLAYING" });
      this.setLevelDelay();
    }
  }

  /**
   * Define current snake head direction according to the head and neck positions
   * @returns {string} - one of the {string} values: "UP"/"LEFT"/"DOWN"/"RIGHT"
   */
  getCurrentHeadDirection() {
    const head = this.state.snake[0],
      neck = this.state.snake[1];

    if (head.y < neck.y) return "UP";
    if (head.x < neck.x) return "LEFT";
    if (head.y > neck.y) return "DOWN";
    if (head.x > neck.x) return "RIGHT";
  }

  /**
   * Checking the availability to turn Up
   * @returns {boolean} - `true` if the turn is possible
   */
  tryToTurnUp() {
    const { snake } = this.state,
      direction = this.getCurrentHeadDirection(),
      { canTurnBack, canTurnOnWall } = this.state.defaults,
      head = snake[0];
    if (!canTurnBack && direction === "DOWN") return false;
    if (!canTurnOnWall && head.y <= 0) return false;

    console.info("~ UP");
    this.setState({ direction: "UP" });
    return true;
  }

  /**
   * Checking the availability to turn Left
   * @returns {boolean} - `true` if the turn is possible
   */
  tryToTurnLeft() {
    const { snake } = this.state,
      direction = this.getCurrentHeadDirection(),
      { canTurnBack, canTurnOnWall } = this.state.defaults,
      head = snake[0];

    if (!canTurnBack && direction === "RIGHT") return false;
    if (!canTurnOnWall && head.x <= 0) return false;

    console.info("~ LEFT");
    this.setState({ direction: "LEFT" });
    return true;
  }

  /**
   * Checking the availability to turn Down
   * @returns {boolean} - `true` if the turn is possible
   */
  tryToTurnDown() {
    const { snake, height } = this.state,
      direction = this.getCurrentHeadDirection(),
      { canTurnBack, canTurnOnWall } = this.state.defaults,
      head = snake[0];

    if (!canTurnBack && direction === "UP") return false;
    if (!canTurnOnWall && head.y >= height - 1) return false;

    console.info("~ DOWN");
    this.setState({ direction: "DOWN" });
    return true;
  }

  /**
   * Checking the availability to turn Right
   * @returns {boolean} - `true` if the turn is possible
   */
  tryToTurnRight() {
    const { snake, width } = this.state,
      direction = this.getCurrentHeadDirection(),
      { canTurnBack, canTurnOnWall } = this.state.defaults,
      head = snake[0];

    if (!canTurnBack && direction === "LEFT") return false;
    if (!canTurnOnWall && head.x >= width - 1) return false;

    console.info("~ RIGHT");
    this.setState({ direction: "RIGHT" });
    return true;
  }

  /**
   * Get next position according to Direction and current Head position
   * @returns {Object[]} - an array with properties "x" and "y"
   */
  getNextPosition() {
    const { snake, direction } = this.state;
    let nextPosition = {
      x:
        direction === "LEFT"
          ? snake[0].x - 1
          : direction === "RIGHT"
          ? snake[0].x + 1
          : snake[0].x,
      y:
        direction === "UP"
          ? snake[0].y - 1
          : direction === "DOWN"
          ? snake[0].y + 1
          : snake[0].y
    };

    return nextPosition;
  }

  /**
   * Checking fi there is a collision of the next head position with stage bounds
   * @param {Object[]} nextPosition - coordinates of next head position of moving snake
   * @param {int} nextPosition.x - horizontal coordinate
   * @param {int} nextPosition.y - verttical coordinate
   * @returns {boolean} - `true` if there is a collision of head with stage wall
   */
  checkWallCollisions(nextPosition) {
    const { width, height } = this.state;
    if (
      nextPosition.x < 0 ||
      nextPosition.x >= width ||
      nextPosition.y < 0 ||
      nextPosition.y >= height
    )
      return true;

    return false;
  }

  /**
   * Checking if there is a collision of the next head position with snake itself
   * @param {Object[]} nextPosition - coordinates of next head position of moving snake
   * @param {int} nextPosition.x - horizontal coordinate
   * @param {int} nextPosition.y - verttical coordinate
   * @param {boolean} isGrowing - `true` if there was a rabbit on the nextPosition
   * @returns {boolean} - `true` if there is a collision of head with tail
   */
  checkSnakeCollisions(nextPosition, isGrowing) {
    const { snake } = this.state;
    let snakeTail = snake;

    if (!isGrowing) snakeTail = snakeTail.slice(0, -1);

    if (
      snakeTail.findIndex(
        snakePart =>
          snakePart.x === nextPosition.x && snakePart.y === nextPosition.y
      ) !== -1
    )
      return true;

    return false;
  }

  /**
   * Moving the snake
   * @param {Object[]} nextPosition - coordinates of next head position of moving snake
   * @param {int} nextPosition.x - horizontal coordinate
   * @param {int} nextPosition.y - verttical coordinate
   * @param {boolean} isGrowing - `true` if there was a rabbit on the nextPosition
   */
  toMoveSnake(nextPosition, isGrowing) {
    const { snake, rabbits } = this.state;
    let newSnake = [],
      newRabbits = rabbits;

    if (isGrowing) {
      newSnake.push(nextPosition, ...snake);
    } else {
      newSnake.push(nextPosition, ...snake.slice(0, -1));
    }

    newRabbits = this.updateRabbits(nextPosition);

    this.setState({
      snake: newSnake,
      rabbits: newRabbits
    });
  }

  /**
   * Checking if there is a Rabbit under the Head
   * @param {Object[]} nextPosition - coordinates of next head position of moving snake
   * @param {int} nextPosition.x - horizontal coordinate
   * @param {int} nextPosition.y - verttical coordinate
   * @returns {boolean} - `true` if there is a rabbit on the Next potision
   */
  checkRabbit(nextPosition) {
    const { rabbits } = this.state;

    if (
      rabbits.findIndex(
        rabbit => rabbit.x === nextPosition.x && rabbit.y === nextPosition.y
      ) !== -1
    )
      return true;

    return false;
  }

  /**
   * Eating the rabbit
   * @param {Object[]} nextPosition - coordinates of next head position of moving snake
   * @param {int} nextPosition.x - horizontal coordinate
   * @param {int} nextPosition.y - verttical coordinate
   * @returns {Object[]} - an array of rabbits coordinates (`x`,`y`)
   */
  updateRabbits(nextPosition) {
    let newRabbits = this.state.rabbits;
    const { eatedRabbits, level } = this.state,
      levelStep = this.state.defaults.levelStep;

    // Eat rabbit if needed
    const rabbitIndex = newRabbits.findIndex(
      rabbit => rabbit.x === nextPosition.x && rabbit.y === nextPosition.y
    );
    if (rabbitIndex !== -1) {
      console.log("~ Catched the rabbit");
      // Remove eated rabbit
      newRabbits.splice(rabbitIndex, 1);

      // Raise up level if needed
      if ((eatedRabbits + 1) % levelStep === 0) {
        this.setState({ level: level + 1, eatedRabbits: eatedRabbits + 1 });
      } else {
        this.setState({ eatedRabbits: eatedRabbits + 1 });
      }

      // Add new rabbit
      const newRabbit = this.toAddNewRabbit(
        [].concat(nextPosition, this.state.snake)
      );
      newRabbits.push(newRabbit);
    }

    return newRabbits;
  }

  /**
   * Toggling pause btn - `p`
   */
  togglePause() {
    const { status } = this.state;

    if (status !== "PAUSE" && status !== "PLAYING") return false;

    if (status === "PAUSE") {
      this.setState({ status: "PLAYING" });
    } else {
      this.setState({ status: "PAUSE" });
    }

    return true;
  }

  /**
   * Main moving action (will be eterated later)
   * @returns {boolean} - `true` if there is no collisions
   */
  tryToMove() {
    const { status } = this.state;
    // Don't move, if game is paused. But listeners are staying active
    if (status === "PAUSE") return false;

    let nextPosition = this.getNextPosition();
    const isGrowing = this.checkRabbit(nextPosition);

    if (
      this.checkWallCollisions(nextPosition) ||
      this.checkSnakeCollisions(nextPosition, isGrowing)
    ) {
      // Collision detected
      this.gameOver();
      return false;
    }

    this.toMoveSnake(nextPosition, isGrowing);
    return true;
  }

  /**
   * Case with a tragic ending
   */
  gameOver() {
    console.warn("[ RIP ]");
    this.setState({ status: "GAME_OVER" });
    clearInterval(this.interval);
  }

  /**
   * Prepare game on game starting or restarting
   */
  gamePrepare() {
    const {
      snakeLength,
      rabbitsAmount,
      eatedRabbits,
      length,
      direction
    } = this.state.defaults;
    let snake = [],
      rabbits = [];

    // Snakes
    for (let i = 0; i < snakeLength; i += 1) {
      let snakePart = { x: snakeLength - i - 1, y: 0 };
      snake.push(snakePart);
    }

    // Rabbits
    for (let i = 0; i < rabbitsAmount; i += 1) {
      const newRabbit = this.toAddNewRabbit(snake);
      rabbits.push(newRabbit);
    }

    this.setState({
      snake: snake,
      rabbits: rabbits,
      status: "READY",
      eatedRabbits: eatedRabbits,
      length: length,
      direction: direction
    });
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress);
    this.gamePrepare();
  }

  setLevelDelay() {
    const { startDelay } = this.state.defaults,
      { level } = this.state,
      delay = startDelay - (startDelay * 0.01 - level);

    clearInterval(this.interval);
    this.interval = setInterval(this.tryToMove, delay);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress);
    clearInterval(this.interval);
  }

  toAddNewRabbit(busySpots) {
    const { width, height } = this.state;
    let isNewSpotFree = false,
      newSpot = {};

    // Eterating untill we find a new free rabbit birthplace
    while (!isNewSpotFree) {
      // Generate new coordinates
      newSpot = {
        x: Math.floor(width * Math.random()),
        y: Math.floor(height * Math.random())
      };

      // Check if new coordinates are free of rabbits
      isNewSpotFree = this.checkIfSpotIsFree(newSpot, busySpots);
    }

    return newSpot;
  }

  checkIfSpotIsFree(newSpot, busySpots) {
    const { rabbits } = this.state,
      dotsToBeChecked = busySpots || [];

    if (
      rabbits.findIndex(
        rabbit => newSpot.x === rabbit.x && newSpot.y === rabbit.y
      ) !== -1
    )
      return false;

    if (
      dotsToBeChecked.findIndex(
        snakePart => newSpot.x === snakePart.x && newSpot.y === snakePart.y
      ) !== -1
    )
      return false;

    return true;
  }

  restart() {
    console.info("~ Restart");
    this.gamePrepare();
  }

  render() {
    const { width, height, rabbits, snake, status, level } = this.state,
      snakeLength = snake.length,
      statusClassName =
        status === "GAME_OVER"
          ? "status--game-over"
          : status === "PAUSE"
          ? "status--pause"
          : "";

    return (
      <div className={`App ${statusClassName}`}>
        <h1>Snake</h1>
        <div className="game-screen">
          <PlayField
            width={width}
            height={height}
            rabbits={rabbits}
            snake={snake}
          />
          <StatsPanel level={level} snakeLength={snakeLength}>
            <StatusMessage status={status} handleClick={this.restart} />
          </StatsPanel>
        </div>
      </div>
    );
  }
}

export default App;
