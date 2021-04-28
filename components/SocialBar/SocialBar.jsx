import GitHubIcon from '../GitHubIcon/GitHubIcon';
import LinkedInIcon from '../LinkedInIcon/LinkedInIcon';

const SocialBar = ({ linkedin, github, small }) => (
	<div
		className={
			small
				? 'flex justify-center space-x-1 mt-1'
				: 'flex justify-center space-x-2 mt-2'
		}>
		{linkedin && (
			<div>
				<a href={linkedin} target='_blank'>
					<LinkedInIcon
						className={
							small
								? 'w-4 h-4 fill-current text-gray-400 hover:text-blue-500'
								: 'w-7 h-7 f fill-current text-gray-400 hover:text-blue-500'
						}
					/>
				</a>
			</div>
		)}
		{github && (
			<div>
				<a href={github} target='_blank'>
					<GitHubIcon
						className={
							small
								? 'w-4 h-4 fill-current text-gray-400 hover:text-black'
								: 'w-7 h-7 f fill-current text-gray-400 hover:text-black'
						}
					/>
				</a>
			</div>
		)}
	</div>
);

export default SocialBar;
