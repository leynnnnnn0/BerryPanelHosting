import { Head, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';


interface Site {
    id: number;
    project_name: string;
    github_url: string;
    status: 'pending' | 'cloning' | 'building' | 'built' | 'failed';
    error_message: string | null;
}

interface DashboardProps {
    sites: Site[];
}

const statusVariant: Record<
    Site['status'],
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    pending: 'outline',
    cloning: 'secondary',
    building: 'secondary',
    built: 'default',
    failed: 'destructive',
};


export default function Dashboard({ sites }: DashboardProps) {
    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] =
        useState<boolean>(false);
    const items = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
    ];

    const { data, setData, post } = useForm({
        project_name: '',
        github_url: '',
        is_dockerized: 'no',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        console.log(data);
        e.preventDefault();
        post('/deploy', {
            onSuccess: (res) => {
                console.log(res);
            },
            onError: (err) => {
                console.log(err);
            },
        });
    };
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Good morning, Peter!
                </h1>

                <Dialog
                    open={isNewProjectDialogOpen}
                    onOpenChange={setIsNewProjectDialogOpen}
                >
                    <form>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => setIsNewProjectDialogOpen(true)}
                                variant="outline"
                                className="cursor-pointer"
                            >
                                <GitBranch data-icon="inline-start" /> New
                                Deployment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader className="border-b pb-5">
                                <DialogTitle className="text-xs font-light">
                                    New Deployment
                                </DialogTitle>
                                <DialogDescription className="text-2xl font-bold text-black">
                                    Connect a GitHub repository and BerryPanel
                                    will prepare the application workspace.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup className="grid grid-cols-2 gap-5">
                                <Field className="col-span-2">
                                    <Label htmlFor="github-url">
                                        Github Repository
                                    </Label>
                                    <Input
                                        id="github-url"
                                        name="github_url"
                                        placeholder="https:://github.com/facebook/react"
                                        value={data.github_url}
                                        onChange={(e) =>
                                            setData(
                                                'github_url',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="project-name">
                                        Project Name
                                    </Label>
                                    <Input
                                        id="project-name"
                                        name="project_name"
                                        placeholder="facebook"
                                        value={data.project_name}
                                        onChange={(e) =>
                                            setData(
                                                'project_name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="is-dockerized">
                                        Is your project already dockerized?
                                    </Label>
                                    <Select
                                        items={items}
                                        value={data.is_dockerized}
                                        onValueChange={(value) =>
                                            setData('is_dockerized', value)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {items.map((item) => (
                                                    <SelectItem
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose
                                    render={
                                        <Button variant="outline">
                                            Cancel
                                        </Button>
                                    }
                                />
                                <Button
                                    type="submit"
                                    className="w-full"
                                    onClick={(e) => handleSubmit(e)}
                                >
                                    Deploy
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </form>
                </Dialog>
            </div>

            <div className="mt-8 rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Project</TableHead>
                            <TableHead>Repository</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sites.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center text-muted-foreground"
                                >
                                    No deployments yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sites.map((site) => (
                                <TableRow key={site.id}>
                                    <TableCell className="font-medium">
                                        {site.project_name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {site.github_url}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={statusVariant[site.status]}
                                        >
                                            {site.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
