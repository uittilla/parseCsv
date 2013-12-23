#!/usr/bin/perl

package Parse;

use strict;
use warnings;
use URI;
use File::Basename;
use Data::Dumper;

our $VERSION = '0.01';

# constructor
sub new {
    my ($class, $file) = @_;
    my $self = bless {},$class;
    
    $self->{filename}    = $file;
    $self->{input_array} = [];
        
    return $self;
}

sub open {
    my ($self) = @_;    
    
    open(my $data, '<', $self->{filename}) or die "Could not open '$self->filname' $!\n";
    while (my $line = <$data>) {
        chomp $line; 
        my @fields = split(/,/, $line);
        
        push($self->{input_array}, @fields);         
    }   
    
    close($data); 
}

# Create an hash of arrays based upon the domain
sub parse {
    my ($self) = @_;    
    
    my %hash = ();
    
    # creates the hash using domain as the key
    foreach (@{$self->{input_array}}) {
        my $link = URI->new($_);
        if (!exists $hash{$link->host( )}) {
            $hash{$link->host()} = [];
        }
    }   
    
    # populates all links that match the hash key (domain)
    foreach (@{$self->{input_array}}) {
        my $link = URI->new($_);
        
        if (exists $hash{$link->host( )}) {
            push($hash{$link->host( )}, $_);
        }        
    }    
    
    $self->reduce(%hash);
}

# reduce the hash of arrays to 20 entries max
sub reduce {
    my ($self, %hash) = @_;         
    
    foreach my $key ( keys %hash ) {
        if(scalar @{$hash{$key}} > 20) {
            splice(@{$hash{$key}}, 20);
        }
    }    
    
    $self->shuffle(%hash);
    
}

# Randomises the array
sub shuffle {
    my ($self, %hash) = @_;   
    my @parsed;
    
    foreach my $key ( keys %hash ) {
        foreach my $entry (@{$hash{$key}}) {
            push(@parsed, $entry);
        }
    }
       
    $self->save(sort { (-1,1)[rand(2)] } @parsed);
}

# write it back out
sub save {
    my ($self, @parsed) = @_;         
    
    my ($file,$dir,$ext) = fileparse($self->{filename}, qr/\.[^.]*/);
        
    open(FILE, ">>$file-parsed$ext") or die "Could not open '$file-parsed$ext' $!\n";
    
    foreach(@parsed) {
        print FILE "$_,\n";    
    }
    
    close(FILE);
    
    print "Done";
}    

1;

my $parser = Parse->new("./perl-testParse.csv");

$parser->open();
$parser->parse();

