Create an HTML5 Canvas-based basketball shooting game with the following features:

Game Setup:

Use a full-page canvas with a light background.
Implement a responsive design that scales with the window size.


Court Elements:

Draw a backboard at the top center of the canvas, spanning a significant portion of the canvas width.
Inside the backboard, draw a smaller square.
Below the inner square, draw a red rectangle representing the rim, slightly wider than the inner square.
Add a gray support beam from the center of the rim extending downwards.


Ball:

Represent the ball as an orange circle with black lines to mimic a basketball's seams.
Implement a size perspective effect: the ball should appear smaller as it moves upward.


Physics:

Apply gravity to the ball's vertical movement.
Implement air resistance affecting the ball's velocity.
The ball should bounce off the canvas edges with some energy loss.


Shooting Mechanism:

Allow the player to drag the ball to aim (draw an arrow while dragging).
On release, set the ball's velocity based on the drag distance and angle.
Cap the maximum initial velocity.


Rim Interaction:

Create narrow collision zones on both edges of the rim.
If the ball contacts these zones while moving downward, it should bounce off realistically.
Adjust both horizontal and vertical velocities on collision to simulate energy loss.


Scoring:

Award a point when the ball's center passes through the rim while moving downward.
Reset the score if the ball touches the bottom of the screen without scoring.
Track and display the current score and best score (stored in localStorage).


Visual Effects:

Implement ball rotation based on its horizontal velocity.
Ensure proper z-index: the rim should appear in front of the ball when the ball is below it, and behind when the ball is above.


Game Loop:

Use requestAnimationFrame for the game loop.
Separate update and draw functions for game logic and rendering.


User Interaction:

Handle both mouse and touch events for dragging and shooting.



Focus on creating smooth performance, accurate physics simulation, and intuitive gameplay. The game should provide a challenging but fair experience with realistic ball movement and rim interactions."
This version provides a framework for creating the game without specifying exact dimensions or physics values, allowing for more creative interpretation while still capturing the essential elements of the game