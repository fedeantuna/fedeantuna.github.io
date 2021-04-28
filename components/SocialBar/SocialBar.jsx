import GitHubIcon from '../GitHubIcon/GitHubIcon';
import LinkedInIcon from '../LinkedInIcon/LinkedInIcon';

const SocialBar = ({ linkedin, github, spacing, mtop, iconSize }) => (
	<div className={`flex justify-center space-x-${spacing} mt-${mtop}`}>
		{linkedin && (
			<div>
				<a href={linkedin} target='_blank'>
					<LinkedInIcon
						className={`w-${iconSize} h-${iconSize} f fill-current text-gray-400 hover:text-blue-500`}
					/>
				</a>
			</div>
		)}
		{github && (
			<div>
				<a href={github} target='_blank'>
					<GitHubIcon
						className={`w-${iconSize} h-${iconSize} f fill-current text-gray-400 hover:text-black`}
					/>
				</a>
			</div>
		)}
	</div>
);

export default SocialBar;
