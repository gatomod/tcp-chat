import { Component, JSX, children as ch, splitProps } from 'solid-js';

const Button: Component<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = props => {
	const [local, other] = splitProps(props, ['children']);
	const c = ch(() => local.children);

	return (
		<button
			{...other}
			class='px-4 py-2 rounded-md border-2 border-slate-100 flex justify-center items-center hover:bg-slate-100 hover:text-slate-950 active:bg-transparent active:text-white ease-in-out duration-200'>
			{c()}
		</button>
	);
};

export default Button;
