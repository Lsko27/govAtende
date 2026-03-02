interface SubservicesPageProps {
  params: { slug: string };
}

const SubservicesPage = ({ params }: SubservicesPageProps) => {
  return <h1>{params.slug}</h1>;
};

export default SubservicesPage;
