import React from "react";
import "../styles.css";

import PlayField from "./PlayField.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 10,
      height: 10,
      level: 0,
      rabbits: [{ x: 0, y: 1 }],
      snake: [],
      direction: "RIGHT",
      defaults: {
        snakeLength: 3,
        rabbitsAmount: 6,
        canTurnBack: false,
        canTurnOnWall: false,
        rabbitBirthInterval: 5
      }
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  /**
   * Handling the key press to rule the snake
   * @param {Object} event - contains key code in an attribute `keyCode`
   */
  handleKeyPress(event) {
    // w = 87, a = 65, s = 83, d = 68
    // up = 38, left = 37, down = 40, right = 39
    var keycode = event.keyCode ? event.keyCode : event.which;

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

    if (keycode === 32) this.tryToMove(); // temporarily keybinding to trigger movement
  }

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
   * Checking fi there is a collision of the next head position with snake itself
   * @param {Object[]} nextPosition - coordinates of next head position of moving snake
   * @param {int} nextPosition.x - horizontal coordinate
   * @param {int} nextPosition.y - verttical coordinate
   * @param {boolean} isGrowing - `true` if there was a rabbit on the nextPosition
   */
  checkSnakeCollisions(nextPosition, isGrowing) {
    const { snake } = this.state;
    let snakeTail = snake;
    if (!isGrowing) {
      snakeTail = snakeTail.slice(0, -1);
    }

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
   * @param {int} rabbitIndex - index of a elements in an array `this.state.rabbits` that should be removed
   */
  updateRabbits(nextPosition) {
    let newRabbits = this.state.rabbits;

    // Eat rabbit if needed
    const rabbitIndex = newRabbits.findIndex(
      rabbit => rabbit.x === nextPosition.x && rabbit.y === nextPosition.y
    );
    if (rabbitIndex !== -1) newRabbits = newRabbits.splice(rabbitIndex, 1);

    // Add new rabbit if needed

    return newRabbits;
  }

  /**
   * Main moving action (will be eterated later)
   */
  tryToMove() {
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

  gameOver() {
    console.info("... to be continued.");
  }

  componentDidMount() {
    const { snakeLength, rabbitsAmount } = this.state.defaults;
    let snake = [],
      rabbits = [];

    // Snakes
    for (let i = 0; i < snakeLength; i += 1) {
      let snakePart = { x: snakeLength - i - 1, y: 0 };
      snake.push(snakePart);
    }

    // Rabbits
    for (let i = 0; i < rabbitsAmount; i += 1) {
      const newRabbit = this.toAddNewRabbit();
      console.log(newRabbit);
      rabbits.push(newRabbit);
    }

    this.setState({
      rabbits: rabbits,
      snake: snake
    });
    document.addEventListener("keydown", this.handleKeyPress);
  }

  toAddNewRabbit() {
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
      isNewSpotFree = this.checkIfSpotIsFree(newSpot);
    }

    return newSpot;
  }

  checkIfSpotIsFree(newSpot) {
    const { rabbits } = this.state;

    if (
      rabbits.findIndex(
        rabbit => rabbit.x === newSpot.x && rabbit.y === newSpot.y
      ) === -1
    )
      return true;

    return false;
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress);
  }

  render() {
    const { width, height, rabbits, snake } = this.state;

    return (
      <div className="App">
        <h1>Snake</h1>
        <PlayField
          width={width}
          height={height}
          rabbits={rabbits}
          snake={snake}
        />
      </div>
    );
  }
}

export default App;
