import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { PageHeader } from '../components/layout/PageHeader';

export default function NotFound() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Lost in space" title="Nothing here yet" description="That path doesn’t lead anywhere in your universe." />
      <div>
        <Link to="/dashboard">
          <Button>Back home</Button>
        </Link>
      </div>
    </div>
  );
}
