// Define a React component to render leaves with bold text.
const Leaf = (props: any) => {
	return (
		<span {...props.attributes} style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}>
			{props.children}
		</span>
	);
};

export default Leaf;
