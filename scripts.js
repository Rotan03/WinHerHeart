const backdrop = document.querySelector('.backdrop');
const yesButton = document.querySelector('.yes-button');
const noButton = document.querySelector('.no-button');
const messageContent = document.querySelector('.message-content');
const noResponse = document.querySelector('.no-response');
const ambientLights = [...document.querySelectorAll('.ambient-light')];
const normalDurations = [17, 21, 15];
const excitedDurations = [9, 9.75, 10.5];
let excitementAnimationFrame;
let excitementResetTimeout;
let isExcitementActive = false;
let hasCelebrated = false;

if (backdrop) {
	backdrop.addEventListener('pointermove', (event) => {
		backdrop.style.setProperty('--pointer-x', `${event.clientX}px`);
		backdrop.style.setProperty('--pointer-y', `${event.clientY}px`);
	});
}

if (yesButton) {
	yesButton.addEventListener('click', () => {
		if (!hasCelebrated) {
			hasCelebrated = true;
			messageContent.classList.add('celebrating');
			createCelebrationParticles();
			setTimeout(() => {
				const celebrationContent = document.querySelector('.celebration-content');
				messageContent.classList.add('celebrated');
				celebrationContent.style.setProperty('opacity', '1', 'important');
				celebrationContent.style.setProperty('transform', 'translateY(0) scale(1)', 'important');
				celebrationContent.setAttribute('aria-hidden', 'false');
			}, 2800);
		}

		if (isExcitementActive) {
			return;
		}

		isExcitementActive = true;
		cancelAnimationFrame(excitementAnimationFrame);
		clearTimeout(excitementResetTimeout);
		const startTime = performance.now();
		const rampUpDuration = 2200;
		const rampDownDuration = 4000;

		const updateDurations = (currentTime) => {
			const elapsedTime = currentTime - startTime;
			const rampProgress = elapsedTime <= rampUpDuration
				? elapsedTime / rampUpDuration
				: Math.min((elapsedTime - rampUpDuration) / rampDownDuration, 1);
			const easedProgress = rampProgress < 0.5
				? 2 * rampProgress * rampProgress
				: 1 - ((-2 * rampProgress + 2) ** 2) / 2;

			ambientLights.forEach((light, index) => {
				const duration = elapsedTime <= rampUpDuration
					? normalDurations[index] + (excitedDurations[index] - normalDurations[index]) * easedProgress
					: excitedDurations[index] + (normalDurations[index] - excitedDurations[index]) * easedProgress;
				light.style.setProperty('--ambient-duration', `${duration}s`);
			});

			if (rampProgress < 1) {
				excitementAnimationFrame = requestAnimationFrame(updateDurations);
			} else {
				ambientLights.forEach((light, index) => {
					light.style.setProperty('--ambient-duration', `${normalDurations[index]}s`);
				});
			}
		};

		excitementAnimationFrame = requestAnimationFrame(updateDurations);
		excitementResetTimeout = setTimeout(() => {
			cancelAnimationFrame(excitementAnimationFrame);
			ambientLights.forEach((light, index) => {
				light.style.setProperty('--ambient-duration', `${normalDurations[index]}s`);
			});
			isExcitementActive = false;
		}, rampUpDuration + rampDownDuration + 50);
	});
}

if (noButton) {
	noButton.addEventListener('click', () => {
		backdrop.classList.remove('is-blue');
		backdrop.classList.add('is-no-response');
		messageContent.classList.add('no-response-state');
		setTimeout(() => {
			noResponse.classList.add('is-visible');
			noResponse.setAttribute('aria-hidden', 'false');
		}, 3400);
	});
}

function createCelebrationParticles() {
	const particleEmojis = ['🎉', '🥳', '✨', '🎊', '😊', '🫨', '😄', '😌', '🙌', '🌟', '🥳'];
	const particleContainer = document.querySelector('.response-buttons');

	Array.from({ length: 3 }, () => particleEmojis)
		.flat()
		.forEach((emoji, index) => {
		const particle = document.createElement('span');
		const angle = (index / 33) * Math.PI * 2;
		const distance = 180 + (index % 6) * 45;
		const duration = 1200 + (index % 8) * 180;

		particle.className = 'emoji-particle';
		particle.textContent = emoji;
		particle.setAttribute('aria-hidden', 'true');
		particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
		particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
		particle.style.setProperty('--particle-rotation', `${(index % 2 ? 1 : -1) * (25 + index * 8)}deg`);
		particle.style.setProperty('--particle-duration', `${duration}ms`);
		particle.style.setProperty('--particle-delay', `${(index % 7) * 55}ms`);
		particleContainer.appendChild(particle);
		setTimeout(() => particle.remove(), duration + 350);
	});

	const surpriseParticle = document.createElement('span');
	surpriseParticle.className = 'emoji-particle surprise-particle';
	surpriseParticle.textContent = '😱';
	surpriseParticle.setAttribute('aria-hidden', 'true');
	particleContainer.appendChild(surpriseParticle);
	setTimeout(() => surpriseParticle.remove(), 2500);
}
